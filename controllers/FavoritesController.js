import FavoriteLocation from '../models/FavoriteLocation.js';

// Add a new favorite location (home, work, other)
export const addFavoriteLocation = async (req, res) => {
    const { userId, type, address, name } = req.body;
    try {
        const favoriteLocation = new FavoriteLocation({ userId, type, address, name });
        await favoriteLocation.save();
        res.status(201).json(favoriteLocation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getFavoriteLocations = async (req, res) => {
    const { userId } = req.params;
    try {
        const favoriteLocations = await FavoriteLocation.find({ userId });
        res.status(200).json(favoriteLocations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateFavoriteLocation = async (req, res) => {
    const { userId, address, name } = req.body;
    try {
        const favoriteLocation = await FavoriteLocation.findByIdAndUpdate(userId, { address, name, updatedAt: Date.now() }, { new: true });
        if (!favoriteLocation) {
            return res.status(404).json({ error: 'Favorite location not found' });
        }
        res.status(200).json(favoriteLocation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteFavoriteLocation = async (req, res) => {
    const { userId } = req.body;
    try {
        const favoriteLocation = await FavoriteLocation.findByIdAndDelete(userId);
        if (!favoriteLocation) {
            return res.status(404).json({ error: 'Favorite location not found' });
        }
        res.status(200).json({ message: 'Favorite location deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
