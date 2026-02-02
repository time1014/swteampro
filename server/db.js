const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'ls-123236bae8a1a4504b7a55b2342dece7011546a3.clue8aqueeuk.ap-northeast-2.rds.amazonaws.com',
    user: 'admin',
    password: '123123123',
    database: 'worldcup'
};
let connection;

async function initializeDatabase() {
    connection = await mysql.createConnection(dbConfig);
    console.log("Database connected successfully");
    return connection;  // 반환하여 외부에서도 사용할 수 있게 함
}

async function getRecentKeywords() {
    try {
        const [rows] = await connection.execute(
            `SELECT keyword
             FROM (
                 SELECT keyword, MAX(date) AS max_date
                 FROM tournaments
                 GROUP BY keyword
             ) AS t
             ORDER BY max_date DESC
             LIMIT 5`
        );
        const recentKeywords = rows.map(row => row.keyword);
        return recentKeywords;
    } catch (error) {
        console.error("Failed to get recent keywords from database", error);
        return [];
    }
}

async function saveTournament(keyword, winner, winnerImage, gender, ageGroup) {
    try {
        console.log(gender+" "+ageGroup)
        const [results] = await connection.execute(
            'INSERT INTO tournaments (keyword, winner, winnerImage, gender, age_group) VALUES (?, ?, ?, ?, ?)',
            [keyword, winner, winnerImage, gender, ageGroup]
        );
        console.log('Tournament saved with ID:', results.insertId);
        return results.insertId;
    } catch (error) {
        console.error("Failed to save tournament to database", error);
        return null;
    }
}

async function closeDatabase() {
    if (connection) {
        try {
            await connection.end();
            console.log("Database connection closed");
        } catch (error) {
            console.error("Failed to close database connection", error);
        }
    }
}

async function updateKeywordStats(userKeyword, suggestedKeyword, isWinner) {
    try {
        const [result] = await connection.execute(
            `INSERT INTO keyword_stats (user_keyword, suggested_keyword, wins, total)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                 wins = wins + VALUES(wins), 
                 total = total + VALUES(total)`,
            [userKeyword, suggestedKeyword, isWinner ? 1 : 0, 1]
        );
        console.log(`Stats updated for user keyword: ${userKeyword}, suggested keyword: ${suggestedKeyword}, Affected Rows: ${result.affectedRows}`);
    } catch (error) {
        console.error("Failed to update keyword stats for user keyword " + userKeyword + " and suggested keyword " + suggestedKeyword, error);
    }
}

async function getRecentTournaments() {
    try {
        const [rows] = await connection.execute(
            `SELECT keyword
             FROM tournaments
             WHERE date BETWEEN DATE_SUB(CURDATE(), INTERVAL 1 WEEK) AND CURDATE() + INTERVAL 1 DAY`
        );
        return rows.map(row => row.keyword);
    } catch (error) {
        console.error("Failed to get recent tournaments from database", error);
        return [];
    }
}

async function a(l, Keyword){
    let winnerKeyword=l

    try {
        console.log("Fetching stats for:", winnerKeyword);
        const [results] = await connection.execute(
            'SELECT wins, total, win_rate FROM keyword_stats WHERE suggested_keyword = ?',
            [winnerKeyword]
        );
        const [result2] = await connection.execute(
            'SELECT SUM(wins) AS totalWins FROM keyword_stats WHERE user_keyword = ?',
            [Keyword]
        );
        const [result3] = await connection.execute(
            'SELECT wins FROM keyword_stats WHERE user_keyword = ? AND suggested_keyword = ?',
            [Keyword, winnerKeyword]
        );
        const resultLi=[results[0], result2[0].totalWins, result3[0].wins]

        // console.dir(resultLi)
        if (results.length > 0) {
            return resultLi;
        } else {
            console.error("No stats found for this winner keyword");
        }
    } catch (error) {
        console.error("Error fetching keyword stats", error);
    }
}


module.exports = { 
    initializeDatabase, 
    getRecentKeywords, 
    saveTournament, 
    closeDatabase,
    getRecentTournaments, 
    updateKeywordStats,
    a };