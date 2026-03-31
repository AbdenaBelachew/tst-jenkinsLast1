const db = require('../db');

class TestService {
  static async insertItem(name) {
    const result = await db.query(
      'INSERT INTO test_items (name) VALUES ($1) RETURNING *',
      [name]
    );
    return result.rows[0];
  }

  static async getItems() {
    const result = await db.query('SELECT * FROM test_items ORDER BY created_at DESC');
    return result.rows;
  }
}

module.exports = TestService;
