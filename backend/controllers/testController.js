const TestService = require('../services/testService');

class TestController {
  static async addItem(req, res) {
    try {
      const { name } = req.body;
      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Name is required' });
      }
      
      const newItem = await TestService.insertItem(name);
      res.status(201).json({
        message: 'Item added successfully',
        data: newItem
      });
    } catch (error) {
      console.error('Error inserting item:', error);
      res.status(500).json({ error: 'Failed to insert item' });
    }
  }

  static async getItems(req, res) {
    try {
      const items = await TestService.getItems();
      res.status(200).json({
        message: 'Items retrieved successfully',
        data: items
      });
    } catch (error) {
      console.error('Error fetching items:', error);
      res.status(500).json({ error: 'Failed to fetch items' });
    }
  }
}

module.exports = TestController;
