const express = require('express');
const router = express.Router();
const { getYouTubeVideos } = require('../services/youtubeService');

/* 유저 전적창 */
router.post('/getYoutubeList/:champion', async (req, res, next) => {
    try {
        const champion = req.params.champion;
        const videoList = await getYouTubeVideos(champion);

        // 유튜브 리스트
        res.json(videoList);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;