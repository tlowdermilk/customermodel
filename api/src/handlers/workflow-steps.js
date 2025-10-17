const db = require('../../shared/db');

/**
 * GET /api/workflow-steps/{profileKey}/{scenarioKey} - Get workflow steps for a scenario
 */
async function handleGet(profileKey, scenarioKey) {
  if (!profileKey || !scenarioKey) {
    return {
      status: 400,
      body: JSON.stringify({ error: 'Profile key and scenario key are required' })
    };
  }
  
  const sql = `
    SELECT 
      BIN_TO_UUID(ws.id, TRUE) AS id,
      BIN_TO_UUID(ws.scenario_id, TRUE) AS scenario_id,
      ws.step_index,
      da.slug AS dev_approach_slug,
      da.name AS dev_approach_name,
      pa.slug AS partner_approach_slug,
      pa.name AS partner_approach_name,
      ws.created_at,
      ws.updated_at
    FROM customermodel.workflow_steps ws
    JOIN customermodel.scenarios s ON s.id = ws.scenario_id
    JOIN customermodel.profiles p ON p.id = s.profile_id
    JOIN customermodel.dev_approaches da ON da.id = ws.dev_approach_id
    JOIN customermodel.partner_approaches pa ON pa.id = ws.partner_approach_id
    WHERE p.profile_key = ? AND s.scenario_key = ?
    ORDER BY ws.step_index
  `;
  
  const results = await db.query(sql, [profileKey, scenarioKey]);
  
  return {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(results)
  };
}

/**
 * POST /api/workflow-steps/{profileKey}/{scenarioKey} - Create/replace workflow steps
 * Body: { steps: [{ dev_approach_slug, partner_approach_slug }, ...] }
 * This replaces ALL steps for the scenario (delete + insert)
 */
async function handlePost(profileKey, scenarioKey, request) {
  if (!profileKey || !scenarioKey) {
    return {
      status: 400,
      body: JSON.stringify({ error: 'Profile key and scenario key are required' })
    };
  }
  
  const body = await request.json();
  const { steps } = body;
  
  if (!Array.isArray(steps)) {
    return {
      status: 400,
      body: JSON.stringify({ error: 'steps must be an array' })
    };
  }
  
  const conn = await db.getConnection();
  
  try {
    await conn.beginTransaction();
    
    // Get scenario_id
    const scenarioSql = `
      SELECT s.id 
      FROM customermodel.scenarios s
      JOIN customermodel.profiles p ON p.id = s.profile_id
      WHERE p.profile_key = ? AND s.scenario_key = ?
    `;
    const [scenarios] = await conn.execute(scenarioSql, [profileKey, scenarioKey]);
    
    if (scenarios.length === 0) {
      await conn.rollback();
      conn.release();
      return {
        status: 404,
        body: JSON.stringify({ error: 'Scenario not found' })
      };
    }
    
    const scenarioId = scenarios[0].id;
    
    // Delete existing steps
    const deleteSql = `DELETE FROM customermodel.workflow_steps WHERE scenario_id = ?`;
    await conn.execute(deleteSql, [scenarioId]);
    
    // Insert new steps
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      // Get dev_approach_id
      const [devApproaches] = await conn.execute(
        'SELECT id FROM customermodel.dev_approaches WHERE slug = ?',
        [step.dev_approach_slug]
      );
      
      // Get partner_approach_id
      const [partnerApproaches] = await conn.execute(
        'SELECT id FROM customermodel.partner_approaches WHERE slug = ?',
        [step.partner_approach_slug]
      );
      
      if (devApproaches.length === 0 || partnerApproaches.length === 0) {
        await conn.rollback();
        conn.release();
        return {
          status: 400,
          body: JSON.stringify({ 
            error: `Invalid approach slug at step ${i + 1}`,
            dev_approach: step.dev_approach_slug,
            partner_approach: step.partner_approach_slug
          })
        };
      }
      
      const insertSql = `
        INSERT INTO customermodel.workflow_steps
        (scenario_id, step_index, dev_approach_id, partner_approach_id)
        VALUES (?, ?, ?, ?)
      `;
      
      await conn.execute(insertSql, [
        scenarioId,
        i + 1,
        devApproaches[0].id,
        partnerApproaches[0].id
      ]);
    }
    
    await conn.commit();
    
    // Fetch the created steps
    const fetchSql = `
      SELECT 
        BIN_TO_UUID(ws.id, TRUE) AS id,
        BIN_TO_UUID(ws.scenario_id, TRUE) AS scenario_id,
        ws.step_index,
        da.slug AS dev_approach_slug,
        da.name AS dev_approach_name,
        pa.slug AS partner_approach_slug,
        pa.name AS partner_approach_name,
        ws.created_at,
        ws.updated_at
      FROM customermodel.workflow_steps ws
      JOIN customermodel.dev_approaches da ON da.id = ws.dev_approach_id
      JOIN customermodel.partner_approaches pa ON pa.id = ws.partner_approach_id
      WHERE ws.scenario_id = ?
      ORDER BY ws.step_index
    `;
    
    const [created] = await conn.execute(fetchSql, [scenarioId]);
    
    conn.release();
    
    return {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(created)
    };
  } catch (error) {
    await conn.rollback();
    conn.release();
    throw error;
  }
}

/**
 * PUT /api/workflow-steps/{profileKey}/{scenarioKey} - Update workflow steps
 * Same as POST - replaces all steps
 */
async function handlePut(profileKey, scenarioKey, request) {
  return await handlePost(profileKey, scenarioKey, request);
}

/**
 * DELETE /api/workflow-steps/{profileKey}/{scenarioKey} - Delete all workflow steps
 */
async function handleDelete(profileKey, scenarioKey) {
  if (!profileKey || !scenarioKey) {
    return {
      status: 400,
      body: JSON.stringify({ error: 'Profile key and scenario key are required' })
    };
  }
  
  const sql = `
    DELETE ws FROM customermodel.workflow_steps ws
    JOIN customermodel.scenarios s ON s.id = ws.scenario_id
    JOIN customermodel.profiles p ON p.id = s.profile_id
    WHERE p.profile_key = ? AND s.scenario_key = ?
  `;
  
  const result = await db.query(sql, [profileKey, scenarioKey]);
  
  return {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Workflow steps deleted successfully' })
  };
}

/**
 * Main handler for workflow-steps endpoint
 */
async function handler(request, context) {
  const method = request.method;
  const profileKey = request.params.profileKey;
  const scenarioKey = request.params.scenarioKey;

  try {
    switch (method) {
      case 'GET':
        return await handleGet(profileKey, scenarioKey);
      case 'POST':
        return await handlePost(profileKey, scenarioKey, request);
      case 'PUT':
        return await handlePut(profileKey, scenarioKey, request);
      case 'DELETE':
        return await handleDelete(profileKey, scenarioKey);
      default:
        return {
          status: 405,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    context.error('Error in workflow-steps function:', error);
    return {
      status: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
}

module.exports = { handler };
