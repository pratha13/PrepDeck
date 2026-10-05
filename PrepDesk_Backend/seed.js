import "dotenv/config";
import mongoose from "mongoose";
import Course from "./models/Course.js";

const L = (...t) => t.map((title) => ({ title }));
const seed = [
  { title: "Striver's A2Z DSA Course", category: "DSA", link: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2",
    description: "A full free DSA sheet that goes from basics to advanced, in a fixed order.", lessons: L("Basics and sorting", "Arrays and binary search", "Linked lists and stacks", "Trees and graphs", "Dynamic programming") },
  { title: "NeetCode 150", category: "DSA", link: "https://neetcode.io/practice",
    description: "150 interview problems grouped by pattern, with free video solutions.", lessons: L("Arrays and hashing", "Two pointers and sliding window", "Trees and tries", "Graphs", "1D and 2D DP") },
  { title: "The Odin Project", category: "Web Development", link: "https://www.theodinproject.com",
    description: "A free project-based path through HTML, CSS, JavaScript, Node and React.", lessons: L("HTML and CSS", "JavaScript", "Node and Express", "Databases", "React") },
  { title: "Learn Java", category: "Java", link: "https://dev.java/learn/",
    description: "The official free tutorials for the Java language.", lessons: L("Language basics", "Classes and objects", "Collections", "Streams and lambdas", "Concurrency") },
  { title: "The Python Tutorial", category: "Python", link: "https://docs.python.org/3/tutorial/",
    description: "The official guided tour of Python, free to read.", lessons: L("Syntax and data types", "Control flow and functions", "Modules and files", "Classes", "Standard library") },
  { title: "Practical Deep Learning", category: "AI/ML", link: "https://course.fast.ai",
    description: "A free, code-first course on deep learning from fast.ai.", lessons: L("Your first model", "Computer vision", "Natural language", "Tabular data", "Deployment") },
  { title: "CryptoZombies", category: "Blockchain", link: "https://cryptozombies.io",
    description: "Learn Solidity by building a small game, free and interactive.", lessons: L("Solidity basics", "Functions and storage", "Contracts and tokens", "Security") },
  { title: "OverTheWire Wargames", category: "Cyber Security", link: "https://overthewire.org/wargames/",
    description: "Free hands-on security puzzles, from Linux basics upward.", lessons: L("Bandit: Linux basics", "Natas: web security", "Leviathan", "Krypton: crypto") },
];

await mongoose.connect(process.env.MONGO_URI);
if (await Course.countDocuments()) console.log("Courses already exist, skipping");
else { await Course.insertMany(seed); console.log(`Added ${seed.length} courses`); }
await mongoose.disconnect();
