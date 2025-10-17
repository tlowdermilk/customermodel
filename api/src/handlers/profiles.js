const db = require('../../shared/db');

/**
 * GET /api/profiles - Get all profiles
 * GET /api/profiles/{profileKey} - Get specific profile by key
 */
async function handleGet(profileKey) {
  if (!profileKey) {
    // Get all profiles
    const sql = `
      SELECT 
        BIN_TO_UUID(id, TRUE) AS id,
        profile_key,
        display_name,
        expertise,
        aicapability,
        governance,
        created_at,
        updated_at
      FROM customermodel.profiles
      ORDER BY display_name
    `;
    const results = await db.query(sql);
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(results)
    };
  } else {
    // Get specific profile by profile_key
    const sql = `
      SELECT 
        BIN_TO_UUID(id, TRUE) AS id,
        profile_key,
        display_name,
        expertise,
        aicapability,
        governance,
        created_at,
        updated_at
      FROM customermodel.profiles
      WHERE profile_key = ?
    `;
    const results = await db.query(sql, [profileKey]);
    
    if (results.length === 0) {
      return {
        status: 404,
        body: JSON.stringify({ error: 'Profile not found' })
      };
    }
    
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(results[0])
    };
  }
}

/**
 * POST /api/profiles - Create new profile
 * Body: { profile_key, display_name, expertise, aicapability, governance }
 */
async function handlePost(request) {
  const body = await request.json();
  const { profile_key, display_name, expertise, aicapability, governance } = body;
  
  if (!profile_key || !display_name) {
    return {
      status: 400,
      body: JSON.stringify({ error: 'profile_key and display_name are required' })
    };
  }
  
  const sql = `
    INSERT INTO customermodel.profiles 
    (profile_key, display_name, expertise, aicapability, governance)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  const result = await db.query(sql, [
    profile_key,
    display_name,
    expertise || 50,
    aicapability || 50,
    governance || 50
  ]);
  
  // Fetch the created profile
  const fetchSql = `
    SELECT 
      BIN_TO_UUID(id, TRUE) AS id,
      profile_key,
      display_name,
      expertise,
      aicapability,
      governance,
      created_at,
      updated_at
    FROM customermodel.profiles
    WHERE profile_key = ?
  `;
  const created = await db.query(fetchSql, [profile_key]);
  
  return {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(created[0])
  };
}

/**
 * PUT /api/profiles/{profileKey} - Update profile
 * Body: { display_name?, expertise?, aicapability?, governance? }
 */
async function handlePut(profileKey, request) {
  if (!profileKey) {
    return {
      status: 400,
      body: JSON.stringify({ error: 'Profile key is required' })
    };
  }
  
  const body = await request.json();
  const { display_name, expertise, aicapability, governance } = body;
  
  // Build dynamic update query
  const updates = [];
  const params = [];
  
  if (display_name !== undefined) {
    updates.push('display_name = ?');
    params.push(display_name);
  }
  if (expertise !== undefined) {
    updates.push('expertise = ?');
    params.push(expertise);
  }
  if (aicapability !== undefined) {
    updates.push('aicapability = ?');
    params.push(aicapability);
  }
  if (governance !== undefined) {
    updates.push('governance = ?');
    params.push(governance);
  }
  
  if (updates.length === 0) {
    return {
      status: 400,
      body: JSON.stringify({ error: 'No fields to update' })
    };
  }
  
  params.push(profileKey);
  
  const sql = `
    UPDATE customermodel.profiles
    SET ${updates.join(', ')}
    WHERE profile_key = ?
  `;
  
  await db.query(sql, params);
  
  // Fetch updated profile
  const fetchSql = `
    SELECT 
      BIN_TO_UUID(id, TRUE) AS id,
      profile_key,
      display_name,
      expertise,
      aicapability,
      governance,
      created_at,
      updated_at
    FROM customermodel.profiles
    WHERE profile_key = ?
  `;
  const updated = await db.query(fetchSql, [profileKey]);
  
  if (updated.length === 0) {
    return {
      status: 404,
      body: JSON.stringify({ error: 'Profile not found' })
    };
  }
  
  return {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated[0])
  };
}

/**
 * DELETE /api/profiles/{profileKey} - Delete profile (cascades to scenarios and workflow_steps)
 */
async function handleDelete(profileKey) {
  if (!profileKey) {
    return {
      status: 400,
      body: JSON.stringify({ error: 'Profile key is required' })
    };
  }
  
  const sql = `
    DELETE FROM customermodel.profiles
    WHERE profile_key = ?
  `;
  
  const result = await db.query(sql, [profileKey]);
  
  if (result.affectedRows === 0) {
    return {
      status: 404,
      body: JSON.stringify({ error: 'Profile not found' })
    };
  }
  
  return {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Profile deleted successfully' })
  };
}

/**
 * Main handler for profiles endpoint
 */
async function handler(request, context) {
  const method = request.method;
  const profileKey = request.params.profileKey;

  try {
    switch (method) {
      case 'GET':
        return await handleGet(profileKey);
      case 'POST':
        return await handlePost(request);
      case 'PUT':
        return await handlePut(profileKey, request);
      case 'DELETE':
        return await handleDelete(profileKey);
      default:
        return {
          status: 405,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    context.error('Error in profiles function:', error);
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
