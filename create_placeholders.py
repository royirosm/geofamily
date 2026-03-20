import os

# Define files and their placeholder content
files = {
    "src/data/countries.js": "// TODO",
    "src/hooks/useCountries.js": "// TODO",
    "src/hooks/usePlayerProgress.js": "// TODO",
    "src/hooks/useLeaderboard.js": "// TODO",
    "src/services/firebase.js": "// TODO",
    "src/components/QuizEngine/index.jsx": "// TODO",
    "src/components/PlayerSelect/index.jsx": "// TODO",
    "src/components/Leaderboard/index.jsx": "// TODO",
    "src/components/ScoreBoard/index.jsx": "// TODO",
    "src/components/ProgressBar/index.jsx": "// TODO",
    "src/components/AgeMode/index.jsx": "// TODO",
    "src/modules/capitals/MultipleChoice.jsx": "// TODO",
    "src/modules/capitals/Flashcard.jsx": "// TODO",
    "src/modules/capitals/TypeAnswer.jsx": "// TODO",
    "src/modules/_template/index.jsx": "// TODO",
    "src/modules/flags/.gitkeep": "",
    "src/modules/cities/.gitkeep": "",
    "src/modules/map-quiz/.gitkeep": "",
    "public/manifest.json": "{}",
    "public/sw.js": "// TODO",
}

created = []
skipped = []

for filepath, content in files.items():
    # Create directories if they don't exist
    dir_path = os.path.dirname(filepath)
    if dir_path:
        os.makedirs(dir_path, exist_ok=True)

    # Only create file if it doesn't already exist
    if not os.path.exists(filepath):
        with open(filepath, "w") as f:
            f.write(content)
        created.append(filepath)
    else:
        skipped.append(filepath)

print(f"✅ Created {len(created)} file(s):")
for f in created:
    print(f"   + {f}")

if skipped:
    print(f"\n⚠️  Skipped {len(skipped)} existing file(s):")
    for f in skipped:
        print(f"   ~ {f}")
