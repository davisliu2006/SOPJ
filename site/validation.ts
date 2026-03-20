import * as globals from "./globals";
import {ProblemData, SQLSelectResult, SQLUpdateResult, SubmissionData} from "./interfaces";

/**
 * Validates user points based on submissions.
 * @param id - user ID
 */
export async function validateUserPoints(id: number) {
    try {
        let conn = await globals.pool.getConnection();
        let submissions = await conn.query<SQLSelectResult<SubmissionData>>(
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
            let problem = (await conn.query<SQLSelectResult<ProblemData>>(
                "SELECT points FROM problems WHERE id = ?;", [key]
            ))[0];
            if (!problem) {continue;}
            points += val*problem.points;
        }
        await conn.query<SQLUpdateResult>(
            "UPDATE users SET points = ? WHERE id = ?;",
            [points, id]
        );
        conn.release();
    } catch (e) {
        console.log(e);
    }
}