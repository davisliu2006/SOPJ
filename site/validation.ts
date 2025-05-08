import * as globals from "./globals";

export async function validateUserPoints(id: number) {
    try {
        let conn = await globals.pool.getConnection();
        let submissions = await conn.query(
            "SELECT problem, points, totpoints FROM submissions WHERE user = ?;",
            [id]
        );
        let mp = new Map<number,number>();
        for (let submission of submissions) {
            let percent = submission.points/submission.totpoints;
            if (!mp.has(submission.problem)) {
                mp.set(submission.problem, percent);
            } else if (percent > mp.get(submission.problem)) {
                mp.set(submission.problem, percent);
            }
        }

        let points = 0;
        for (let [key, val] of mp.entries()) {
            let problem = (await conn.query("SELECT points FROM problems WHERE id = ?;", [key]))[0];
            if (!problem) {continue;}
            points += val*problem.points;
        }
        await conn.query(
            "UPDATE users SET points = ? WHERE id = ?;",
            [points, id]
        );
        conn.release();
    } catch (e) {
        console.log(e);
    }
}