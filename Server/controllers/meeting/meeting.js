const MeetingHistory = require('../../model/schema/meeting')
const mongoose = require('mongoose');

const add = async (req, res) => {
    try {
        req.body.createdDate = new Date();
        const meeting = new MeetingHistory(req.body);
        await meeting.save();
        res.status(200).json(meeting);
    } catch (err) {
        console.error('Failed to create Meeting:', err);
        res.status(400).json({ error: 'Failed to create Meeting' });
    }
}

const index = async (req, res) => {
    try {
        const query = req.query;
        query.deleted = false;

        let allData = await MeetingHistory.find(query);
        res.status(200).json(allData);
    } catch (error) {
        console.error('Failed to fetch meetings:', error);
        res.status(500).json({ error: 'Failed to fetch meetings' });
    }
}

const view = async (req, res) => {
    try {
        const meetingId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(meetingId)) {
            return res.status(400).json({ error: 'Invalid meeting ID' });
        }

        const meeting = await MeetingHistory.findOne({ _id: meetingId, deleted: false });

        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }

        res.status(200).json(meeting);
    } catch (error) {
        console.error('Failed to fetch meeting:', error);
        res.status(500).json({ error: 'Failed to fetch meeting' });
    }
}

const edit = async (req, res) => {
    try {
        const meetingId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(meetingId)) {
            return res.status(400).json({ error: 'Invalid meeting ID' });
        }

        const updatedMeeting = await MeetingHistory.findByIdAndUpdate(
            meetingId,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!updatedMeeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }

        res.status(200).json(updatedMeeting);
    } catch (error) {
        console.error('Failed to update meeting:', error);
        res.status(400).json({ error: 'Failed to update meeting' });
    }
}

const deleteData = async (req, res) => {
    try {
        const meetingId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(meetingId)) {
            return res.status(400).json({ error: 'Invalid meeting ID' });
        }

        const deletedMeeting = await MeetingHistory.findByIdAndUpdate(
            meetingId,
            { deleted: true },
            { new: true }
        );

        if (!deletedMeeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }

        res.status(200).json({ message: 'Meeting deleted successfully' });
    } catch (error) {
        console.error('Failed to delete meeting:', error);
        res.status(500).json({ error: 'Failed to delete meeting' });
    }
}

const deleteMany = async (req, res) => {
    try {
        const ids = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Invalid or empty IDs array' });
        }

        // Validate all IDs
        const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));

        if (validIds.length === 0) {
            return res.status(400).json({ error: 'No valid IDs provided' });
        }

        const result = await MeetingHistory.updateMany(
            { _id: { $in: validIds } },
            { deleted: true }
        );

        res.status(200).json({
            message: `${result.modifiedCount} meetings deleted successfully`,
            deletedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Failed to delete meetings:', error);
        res.status(500).json({ error: 'Failed to delete meetings' });
    }
}

module.exports = { add, index, view, edit, deleteData, deleteMany }