const menuItems = [
  { id: 1, name: 'Butter Chicken', category: 'dinner', price: '$15.99' },
  { id: 2, name: 'Masala Dosa', category: 'breakfast', price: '$8.99' },
  { id: 3, name: 'Mango Lassi', category: 'drinks', price: '$4.50' }
];

const getMenuItems = async (req, res) => {
  return res.status(200).json(menuItems);
};

module.exports = {
  getMenuItems
};
