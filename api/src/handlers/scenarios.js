const db = require('../../shared/db');

/**
 * GET /api/scenarios - Get all scenarios
 * GET /api/scenarios/{profileKey} - Get scenarios for a profile
 * GET /api/scenarios/{profileKey}/{scenarioKey} - Get specific scenario
 */
async function handleGet(profileKey, scenarioKey) {
  if (profileKey && scenarioKey) {
    // Get specific scenario
    const sql = `
      SELECT 
        BIN_TO_UUID(s.id, TRUE) AS id,
        BIN_TO_UUID(s.profile_id, TRUE) AS profile_id,
        p.profile_key,
        s.scenario_key,
        s.display_name,
        s.importance,
        s.complexity,
        s.maturity,
        s.created_at,
        s.updated_at
      FROM customermodel.scenarios s
      JOIN customermodel.profiles p ON p.id = s.profile_id
      WHERE p.profile_key = ? AND s.scenario_key = ?
    `;
    const results = await db.query(sql, [profileKey, scenarioKey]);
    
    if (results.length === 0) {
      return {
        status: 404,
        body: JSON.stringify({ error: 'Scenario not found' })
      };
    }
    
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(results[0])
    };
  } else if (profileKey) {
    // Get all scenarios for a profile
    const sql = `
      SELECT 
        BIN_TO_UUID(s.id, TRUE) AS id,
        BIN_TO_UUID(s.profile_id, TRUE) AS profile_id,
        p.profile_key,
        s.scenario_key,
        s.display_name,
        s.importance,
        s.complexity,
        s.maturity,
        s.created_at,
        s.updated_at
      FROM customermodel.scenarios s
      JOIN customermodel.profiles p ON p.id = s.profile_id
      WHERE p.profile_key = ?
      ORDER BY s.scenario_key
    `;
    const results = await db.query(sql, [profileKey]);
    
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(results)
    };
  } else {
    // Get all scenarios
    const sql = `
      SELECT 
        BIN_TO_UUID(s.id, TRUE) AS id,
        BIN_TO_UUID(s.profile_id, TRUE) AS profile_id,
        p.profile_key,
        s.scenario_key,
        s.display_name,
        s.importance,
        s.complexity,
        s.maturity,
        s.created_at,
        s.updated_at
      FROM customermodel.scenarios s
      JOIN customermodel.profiles p ON p.id = s.profile_id
      ORDER BY p.profile_key, s.scenario_key
    `;
    const results = await db.query(sql);
    
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(results)
    };
  }
}

/**
 * POST /api/scenarios/{profileKey} - Create new scenario
 * Body: { scenario_key, display_name, importance, complexity, maturity }
 */
async function handlePost(profileKey, request) {
  if (!profileKey) {
    return {
      status: 400,
      body: JSON.stringify({ error: 'Profile key is required in URL' })
    };
  }
  
  const body = await request.json();
  const { scenario_key, display_name, importance, complexity, maturity } = body;
  
  if (!scenario_key || !display_name) {
    return {
      status: 400,
      body: JSON.stringify({ error: 'scenario_key and display_name are required' })
    };
  }
  
  // Get profile_id from profile_key
  const profileSql = `SELECT id FROM customermodel.profiles WHERE profile_key = ?`;
  const profiles = await db.query(profileSql, [profileKey]);
  
  if (profiles.length === 0) {
    return {
      status: 404,
      body: JSON.stringify({ error: 'Profile not found' })
    };
  }
  
  const sql = `
    INSERT INTO customermodel.scenarios 
    (profile_id, scenario_key, display_name, importance, complexity, maturity)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  await db.query(sql, [
    profiles[0].id,
    scenario_key,
    display_name,
    importance || 50,
    complexity || 50,
    maturity || 50
  ]);
  
  // Fetch the created scenario
  const fetchSql = `
    SELECT 
      BIN_TO_UUID(s.id, TRUE) AS id,
      BIN_TO_UUID(s.profile_id, TRUE) AS profile_id,
      p.profile_key,
      s.scenario_key,
      s.display_name,
      s.importance,
      s.complexity,
      s.maturity,
      s.created_at,
      s.updated_at
    FROM customermodel.scenarios s
    JOIN customermodel.profiles p ON p.id = s.profile_id
    WHERE p.profile_key = ? AND s.scenario_key = ?
  `;
  const created = await db.query(fetchSql, [profileKey, scenario_key]);
  
  return {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(created[0])
  };
}

/**
 * PUT /api/scenarios/{profileKey}/{scenarioKey} - Update scenario
 * Body: { display_name?, importance?, complexity?, maturity? }
 */
async function handlePut(profileKey, scenarioKey, request) {
  if (!profileKey || !scenarioKey) {
    return {
      status: 400,
      body: JSON.stringify({ error: 'Profile key and scenario key are required' })
    };
  }
  
  const body = await request.json();
  const { display_name, importance, complexity, maturity } = body;
  
  // Build dynamic update query
  const updates = [];
  const params = [];
  
  if (display_name !== undefined) {
    updates.push('s.display_name = ?');
    params.push(display_name);
  }
  if (importance !== undefined) {
    updates.push('s.importance = ?');
    params.push(importance);
  }
  if (complexity !== undefined) {
    updates.push('s.complexity = ?');
    params.push(complexity);
  }
  if (maturity !== undefined) {
    updates.push('s.maturity = ?');
    params.push(maturity);
  }
  
  if (updates.length === 0) {
    return {
      status: 400,
      body: JSON.stringify({ error: 'No fields to update' })
    };
  }
  
  params.push(profileKey, scenarioKey);
  
  const sql = `
    UPDATE customermodel.scenarios s
    JOIN customermodel.profiles p ON p.id = s.profile_id
    SET ${updates.join(', ')}
    WHERE p.profile_key = ? AND s.scenario_key = ?
  `;
  
  await db.query(sql, params);
  
  // Fetch updated scenario
  const fetchSql = `
    SELECT 
      BIN_TO_UUID(s.id, TRUE) AS id,
      BIN_TO_UUID(s.profile_id, TRUE) AS profile_id,
      p.profile_key,
      s.scenario_key,
      s.display_name,
      s.importance,
      s.complexity,
      s.maturity,
      s.created_at,
      s.updated_at
    FROM customermodel.scenarios s
    JOIN customermodel.profiles p ON p.id = s.profile_id
    WHERE p.profile_key = ? AND s.scenario_key = ?
  `;
  const updated = await db.query(fetchSql, [profileKey, scenarioKey]);
  
  if (updated.length === 0) {
    return {
      status: 404,
      body: JSON.stringify({ error: 'Scenario not found' })
    };
  }
  
  return {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated[0])
  };
}

/**
 * DELETE /api/scenarios/{profileKey}/{scenarioKey} - Delete scenario (cascades to workflow_steps)
 */
async function handleDelete(profileKey, scenarioKey) {
  if (!profileKey || !scenarioKey) {
    return {
      status: 400,
      body: JSON.stringify({ error: 'Profile key and scenario key are required' })
    };
  }
  
  const sql = `
    DELETE s FROM customermodel.scenarios s
    JOIN customermodel.profiles p ON p.id = s.profile_id
    WHERE p.profile_key = ? AND s.scenario_key = ?
  `;
  
  const result = await db.query(sql, [profileKey, scenarioKey]);
  
  if (result.affectedRows === 0) {
    return {
      status: 404,
      body: JSON.stringify({ error: 'Scenario not found' })
    };
  }
  
  return {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Scenario deleted successfully' })
  };
}

/**
 * Main handler for scenarios endpoint
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
        return await handlePost(profileKey, request);
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
    context.error('Error in scenarios function:', error);
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
