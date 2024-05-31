import express from 'express';
import { addFavoriteLocation, getFavoriteLocations, updateFavoriteLocation, deleteFavoriteLocation } from '../controllers/FavoritesController.js';

const router = express.Router();

router.post('/add-favorites', addFavoriteLocation);
router.get('/get-favorites', getFavoriteLocations);
router.put('/update-favorites', updateFavoriteLocation);
router.delete('/favorites', deleteFavoriteLocation);

export default router;
