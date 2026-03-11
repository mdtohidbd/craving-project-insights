import express from 'express';
import { Reservation } from '../models/Reservation';

const router = express.Router();

// Get all reservations
router.get('/', async (req, res) => {
    try {
        const reservations = await Reservation.find().sort({ createdAt: -1 });
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reservations' });
    }
});

// Create a new reservation
router.post('/', async (req, res) => {
    try {
        const { date, time, guests, name, phone, requests } = req.body;
        const bookingId = `RES-${Math.floor(100000 + Math.random() * 900000)}`;

        const newReservation = new Reservation({
            date,
            time,
            guests,
            name,
            phone,
            requests,
            bookingId
        });

        const savedReservation = await newReservation.save();
        res.status(201).json(savedReservation);
    } catch (error) {
        res.status(500).json({ message: 'Error creating reservation' });
    }
});

// Update a reservation
router.put('/:id', async (req, res) => {
    try {
        const updatedReservation = await Reservation.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedReservation);
    } catch (error) {
        res.status(500).json({ message: 'Error updating reservation' });
    }
});

// Delete a reservation
router.delete('/:id', async (req, res) => {
    try {
        await Reservation.findByIdAndDelete(req.params.id);
        res.json({ message: 'Reservation deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting reservation' });
    }
});

export default router;
