import User from "../models/User.js";

export const createUser = async (req, res) => {
  const { uid, email, photoURL, username } = req.body;

  if (!uid || !email) {
    return res.status(400).json({ error: "Missing uid or email" });
  }

  try {
    const existing = await User.findOne({ uid });
    if (existing) {
      return res.status(200).json({ message: "User already exists" });
    }

    const newUser = new User({ uid, email, photoURL, username});
    await newUser.save();

    res.status(201).json({ message: "User added to database", user: newUser });
  } catch (error) {
    console.error("User creation failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserById = async (req, res) => {
  const { uid } = req.params;

  if (!uid) {
    return res.status(400).json({ error: "Missing uid parameter" });
  }

  try {
    const user = await User.findOne({ uid });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
