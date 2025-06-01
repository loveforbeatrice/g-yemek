const Address = require('../models/Address');

// Tüm adresleri getir
exports.getAllAddresses = async (req, res) => {
  try {
    // Gerçek uygulamada kullanıcı kimlik doğrulaması olacak
    // ve sadece o kullanıcının adresleri getirilecek
    const userId = req.query.userId || 'testuser';
    const addresses = await Address.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Yeni adres ekle
exports.createAddress = async (req, res) => {
  try {
    const { name, address } = req.body;
    // Gerçek uygulamada kullanıcı kimlik doğrulaması olacak
    const userId = req.body.userId || 'testuser';
    
    const newAddress = await Address.create({
      userId,
      name,
      address
    });
    
    res.status(201).json(newAddress);
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Adres güncelle
exports.updateAddress = async (req, res) => {
  try {
    const { name, address } = req.body;
    const addressId = req.params.id;
    
    const [updated] = await Address.update(
      { name, address },
      { where: { id: addressId } }
    );
    
    if (updated === 0) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    const updatedAddress = await Address.findByPk(addressId);
    res.status(200).json(updatedAddress);
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Adres sil
exports.deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const deleted = await Address.destroy({ where: { id: addressId } });
    
    if (deleted === 0) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
