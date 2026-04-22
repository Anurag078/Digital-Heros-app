import db from "../config/db.js";

// ADD SCORE
export const addScore = async (req, res) => {
  const userId = req.user.id;
  const { score, date } = req.body;

  // validation
  if (score < 1 || score > 45) {
    return res.status(400).json({ message: "Score must be between 1-45" });
  }

  // check duplicate date
  const { data: existing } = await db.from("scores")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date);

  if (existing && existing.length > 0) {
    return res.status(400).json({ message: "Score for this date already exists" });
  }

  // insert new
  const { error } = await db.from("scores").insert({
    user_id: userId,
    score,
    date
  });

  if (error) return res.status(500).json(error);

  // Maintain latest 5 logic: delete all but top 5 by date DESC
  const { data: allScores } = await db.from("scores")
    .select("id")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (allScores && allScores.length > 5) {
      const idsToDelete = allScores.slice(5).map(s => s.id);
      for (const id of idsToDelete) {
          await db.from("scores").delete().eq("id", id);
      }
  }

  res.json({ message: "Score added successfully" });
};

// GET SCORES
export const getScores = async (req, res) => {
    const userId = req.user.id;

    const { data, error } = await db.from("scores")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });

    if (error) return res.status(500).json(error);
    res.json(data);
};