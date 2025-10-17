const db = require('../../shared/db');

/**
 * GET /api/products - Get all products with their capabilities
 * GET /api/products/{productKey} - Get specific product with capabilities
 */
async function handleGet(productKey) {
  if (productKey) {
    // Get specific product
    const productSql = `
      SELECT 
        BIN_TO_UUID(id, TRUE) AS id,
        product_key,
        display_name
      FROM customermodel.products
      WHERE product_key = ?
    `;
    const products = await db.query(productSql, [productKey]);
    
    if (products.length === 0) {
      return {
        status: 404,
        body: JSON.stringify({ error: 'Product not found' })
      };
    }
    
    // Get capabilities for this product
    const capabilitiesSql = `
      SELECT 
        BIN_TO_UUID(pc.id, TRUE) AS id,
        pc.position,
        da.slug AS dev_approach_slug,
        da.name AS dev_approach_name,
        pa.slug AS partner_approach_slug,
        pa.name AS partner_approach_name
      FROM customermodel.product_capabilities pc
      JOIN customermodel.dev_approaches da ON da.id = pc.dev_approach_id
      JOIN customermodel.partner_approaches pa ON pa.id = pc.partner_approach_id
      JOIN customermodel.products p ON p.id = pc.product_id
      WHERE p.product_key = ?
      ORDER BY pc.position
    `;
    const capabilities = await db.query(capabilitiesSql, [productKey]);
    
    const product = products[0];
    product.capabilities = capabilities;
    
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    };
  } else {
    // Get all products with their capabilities
    const productsSql = `
      SELECT 
        BIN_TO_UUID(id, TRUE) AS id,
        product_key,
        display_name
      FROM customermodel.products
      ORDER BY product_key
    `;
    const products = await db.query(productsSql);
    
    // Get all capabilities
    const capabilitiesSql = `
      SELECT 
        BIN_TO_UUID(pc.id, TRUE) AS id,
        p.product_key,
        pc.position,
        da.slug AS dev_approach_slug,
        da.name AS dev_approach_name,
        pa.slug AS partner_approach_slug,
        pa.name AS partner_approach_name
      FROM customermodel.product_capabilities pc
      JOIN customermodel.products p ON p.id = pc.product_id
      JOIN customermodel.dev_approaches da ON da.id = pc.dev_approach_id
      JOIN customermodel.partner_approaches pa ON pa.id = pc.partner_approach_id
      ORDER BY p.product_key, pc.position
    `;
    const capabilities = await db.query(capabilitiesSql);
    
    // Group capabilities by product
    const capabilitiesMap = {};
    capabilities.forEach(cap => {
      if (!capabilitiesMap[cap.product_key]) {
        capabilitiesMap[cap.product_key] = [];
      }
      capabilitiesMap[cap.product_key].push({
        id: cap.id,
        position: cap.position,
        dev_approach_slug: cap.dev_approach_slug,
        dev_approach_name: cap.dev_approach_name,
        partner_approach_slug: cap.partner_approach_slug,
        partner_approach_name: cap.partner_approach_name
      });
    });
    
    // Attach capabilities to products
    products.forEach(product => {
      product.capabilities = capabilitiesMap[product.product_key] || [];
    });
    
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(products)
    };
  }
}

/**
 * POST /api/products - Create new product with capabilities
 * Body: { 
 *   product_key, 
 *   display_name, 
 *   capabilities: [{ dev_approach_slug, partner_approach_slug }, ...]
 * }
 */
async function handlePost(request) {
  const body = await request.json();
  const { product_key, display_name, capabilities = [] } = body;
  
  if (!product_key || !display_name) {
    return {
      status: 400,
      body: JSON.stringify({ error: 'product_key and display_name are required' })
    };
  }
  
  const conn = await db.getConnection();
  
  try {
    await conn.beginTransaction();
    
    // Insert product
    const productSql = `
      INSERT INTO customermodel.products (product_key, display_name)
      VALUES (?, ?)
    `;
    await conn.execute(productSql, [product_key, display_name]);
    
    // Get the inserted product id
    const [products] = await conn.execute(
      'SELECT id FROM customermodel.products WHERE product_key = ?',
      [product_key]
    );
    const productId = products[0].id;
    
    // Insert capabilities
    for (let i = 0; i < capabilities.length; i++) {
      const cap = capabilities[i];
      
      // Get approach IDs
      const [devApproaches] = await conn.execute(
        'SELECT id FROM customermodel.dev_approaches WHERE slug = ?',
        [cap.dev_approach_slug]
      );
      
      const [partnerApproaches] = await conn.execute(
        'SELECT id FROM customermodel.partner_approaches WHERE slug = ?',
        [cap.partner_approach_slug]
      );
      
      if (devApproaches.length === 0 || partnerApproaches.length === 0) {
        await conn.rollback();
        conn.release();
        return {
          status: 400,
          body: JSON.stringify({ 
            error: `Invalid approach slug at capability ${i + 1}` 
          })
        };
      }
      
      const capSql = `
        INSERT INTO customermodel.product_capabilities
        (product_id, dev_approach_id, partner_approach_id, position)
        VALUES (?, ?, ?, ?)
      `;
      
      await conn.execute(capSql, [
        productId,
        devApproaches[0].id,
        partnerApproaches[0].id,
        i + 1
      ]);
    }
    
    await conn.commit();
    conn.release();
    
    // Fetch and return the created product
    return await handleGet(product_key);
  } catch (error) {
    await conn.rollback();
    conn.release();
    throw error;
  }
}

/**
 * PUT /api/products/{productKey} - Update product and/or capabilities
 * Body: { 
 *   display_name?, 
 *   capabilities?: [{ dev_approach_slug, partner_approach_slug }, ...]
 * }
 */
async function handlePut(productKey, request) {
  if (!productKey) {
    return {
      status: 400,
      body: JSON.stringify({ error: 'Product key is required' })
    };
  }
  
  const body = await request.json();
  const { display_name, capabilities } = body;
  
  const conn = await db.getConnection();
  
  try {
    await conn.beginTransaction();
    
    // Get product id
    const [products] = await conn.execute(
      'SELECT id FROM customermodel.products WHERE product_key = ?',
      [productKey]
    );
    
    if (products.length === 0) {
      await conn.rollback();
      conn.release();
      return {
        status: 404,
        body: JSON.stringify({ error: 'Product not found' })
      };
    }
    
    const productId = products[0].id;
    
    // Update display_name if provided
    if (display_name !== undefined) {
      const updateSql = `
        UPDATE customermodel.products
        SET display_name = ?
        WHERE product_key = ?
      `;
      await conn.execute(updateSql, [display_name, productKey]);
    }
    
    // Update capabilities if provided
    if (Array.isArray(capabilities)) {
      // Delete existing capabilities
      await conn.execute(
        'DELETE FROM customermodel.product_capabilities WHERE product_id = ?',
        [productId]
      );
      
      // Insert new capabilities
      for (let i = 0; i < capabilities.length; i++) {
        const cap = capabilities[i];
        
        const [devApproaches] = await conn.execute(
          'SELECT id FROM customermodel.dev_approaches WHERE slug = ?',
          [cap.dev_approach_slug]
        );
        
        const [partnerApproaches] = await conn.execute(
          'SELECT id FROM customermodel.partner_approaches WHERE slug = ?',
          [cap.partner_approach_slug]
        );
        
        if (devApproaches.length === 0 || partnerApproaches.length === 0) {
          await conn.rollback();
          conn.release();
          return {
            status: 400,
            body: JSON.stringify({ 
              error: `Invalid approach slug at capability ${i + 1}` 
            })
          };
        }
        
        const capSql = `
          INSERT INTO customermodel.product_capabilities
          (product_id, dev_approach_id, partner_approach_id, position)
          VALUES (?, ?, ?, ?)
        `;
        
        await conn.execute(capSql, [
          productId,
          devApproaches[0].id,
          partnerApproaches[0].id,
          i + 1
        ]);
      }
    }
    
    await conn.commit();
    conn.release();
    
    // Fetch and return the updated product
    return await handleGet(productKey);
  } catch (error) {
    await conn.rollback();
    conn.release();
    throw error;
  }
}

/**
 * DELETE /api/products/{productKey} - Delete product (cascades to capabilities)
 */
async function handleDelete(productKey) {
  if (!productKey) {
    return {
      status: 400,
      body: JSON.stringify({ error: 'Product key is required' })
    };
  }
  
  const sql = `
    DELETE FROM customermodel.products
    WHERE product_key = ?
  `;
  
  const result = await db.query(sql, [productKey]);
  
  if (result.affectedRows === 0) {
    return {
      status: 404,
      body: JSON.stringify({ error: 'Product not found' })
    };
  }
  
  return {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Product deleted successfully' })
  };
}

/**
 * Main handler for products endpoint
 */
async function handler(request, context) {
  const method = request.method;
  const productKey = request.params.productKey;

  try {
    switch (method) {
      case 'GET':
        return await handleGet(productKey);
      case 'POST':
        return await handlePost(request);
      case 'PUT':
        return await handlePut(productKey, request);
      case 'DELETE':
        return await handleDelete(productKey);
      default:
        return {
          status: 405,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    context.error('Error in products function:', error);
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
