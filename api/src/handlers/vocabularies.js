const db = require('../../shared/db');

async function getDevApproaches() {
  const sql = `
    SELECT 
      BIN_TO_UUID(id, TRUE) AS id,
      slug,
      name,
      description,
      sort_order,
      is_active
    FROM customermodel.dev_approaches
    WHERE is_active = 1
    ORDER BY sort_order, name
  `;
  return await db.query(sql);
}

async function getPartnerApproaches() {
  const sql = `
    SELECT 
      BIN_TO_UUID(id, TRUE) AS id,
      slug,
      name,
      description,
      sort_order,
      is_active
    FROM customermodel.partner_approaches
    WHERE is_active = 1
    ORDER BY sort_order, name
  `;
  return await db.query(sql);
}

/**
 * Main handler for vocabularies endpoint
 */
async function handler(request, context) {
  const type = request.params.type;

  try {
    if (!type) {
      // Return all vocabularies
      const devApproaches = await getDevApproaches();
      const partnerApproaches = await getPartnerApproaches();
      
      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dev_approaches: devApproaches,
          partner_approaches: partnerApproaches
        })
      };
    } else if (type === 'dev-approaches') {
      const devApproaches = await getDevApproaches();
      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(devApproaches)
      };
    } else if (type === 'partner-approaches') {
      const partnerApproaches = await getPartnerApproaches();
      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partnerApproaches)
      };
    } else {
      return {
        status: 400,
        body: JSON.stringify({ 
          error: 'Invalid type. Use "dev-approaches" or "partner-approaches"' 
        })
      };
    }
  } catch (error) {
    context.error('Error in vocabularies function:', error);
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
