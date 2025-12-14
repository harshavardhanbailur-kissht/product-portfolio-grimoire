/**
 * THE GRIMOIRE ARCHIVES
 * Content Data Source
 */

const portfolioData = [
    {
        id: "intro",
        title: "Introduction",
        type: "chapter",
        content: `
            <div class="chapter-header">
                <span class="chapter-number">Intro</span>
                <h2 class="chapter-title">The Digital Frontier</h2>
            </div>
            <div class="chapter-intro">
                <p class="intro-quote">"Exploring the intersection of Product Management, Game Design, and Strategy."</p>
                <p>Welcome to the extended archives. Herein lies a collection of deep dives, specifications, and analyses drawn from the vast knowledge base.</p>
            </div>
        `
    },
    {
        id: "game-portfolio",
        title: "Game Dev & Design",
        type: "section",
        children: [
            {
                id: "mini-games",
                title: "Mini Games",
                content: `
                    <div class="chapter-header">
                        <span class="chapter-number">Section</span>
                        <h2 class="chapter-title">Mini Games</h2>
                        <p class="chapter-subtitle">Rough Workings & Initial Drafts</p>
                    </div>
                `,
                children: [
                    {
                        id: "nakshatra",
                        title: "Nakshatra Yaan (Celestial Voyager)",
                        content: `
                            <h3>Nakshatra Yaan (Celestial Voyager)</h3>
                            <p class="intro-quote">"Rocket which will to intergalictic travel and look very advance."</p>
                            
                            <h4>Concept & Vision</h4>
                            <p><strong>Name Origin:</strong> Aakaashagangaonyan / Nakshatra Yaan. Inspired by "Chandrayaan" and "Mangalyaan", but for intergalactic travel. The goal is to show we are soaring high, advanced, and creative.</p>
                            <p><strong>Art Style:</strong> Pixel art. The mascot could be riding the spaceship, which will look super advanced with thrusters allowing multidirectional movement (ovalish figure, potentially with ISRO label or capsule gaming branding).</p>
                            
                            <h4>Core Mechanics</h4>
                            <p><strong>Movement:</strong> Keeping phone screen touched moves the ship in that direction. Partial forward/backward movement allowed.</p>
                            <p><strong>Boosts:</strong></p>
                            <ul class="strategy-list">
                                <li class="strategy-item"><span class="item-marker">◈</span> <strong>Shield:</strong> Extra life kind of ability.</li>
                                <li class="strategy-item"><span class="item-marker">◈</span> <strong>Space Warp:</strong> Speed booster to cover distance rapidly.</li>
                            </ul>
                            
                            <h4>Unique Elements</h4>
                            <p><strong>Research Mechanism:</strong> Coins are covered with purple stuff (gases/nebula). Players must "research technology" to access these coins.</p>
                            <p><strong>Progression:</strong> High scores indicate exploration % of the universe (e.g., "You explored 0.1% of the Milky Way").</p>
                        `
                    },
                    {
                        id: "card-game",
                        title: "Card game",
                        content: `
                            <h3>Strategic Card Game</h3>
                            <p class="intro-quote">"Water splash can defeat fire ball... but water wall won't stand a chance against a continuous flame throwing attack."</p>
                            
                            <h4>Core Concept</h4>
                            <p>A card game with complex elemental interactions, moving beyond simple Rock-Paper-Scissors.</p>
                            
                            <h4>Elemental Physics</h4>
                            <p>Interactions are physics-based rather than just type-based:</p>
                            <ul class="strategy-list">
                                <li class="strategy-item"><span class="item-marker">🔹</span> <strong>Water vs Fire:</strong> Water splash defeats fireball. But aggressive continuous flame evaporates water wall (steam damage).</li>
                                <li class="strategy-item"><span class="item-marker">🔹</span> <strong>Earth vs Fire:</strong> Stone wall withstands fire. Mud ball melts before impact.</li>
                                <li class="strategy-item"><span class="item-marker">🔹</span> <strong>Wind vs Fire:</strong> Tornado catches fire from Dragon's breath, losing momentum but becoming a stationary fire hazard. Pushing it with Wind makes it a moving firestorm.</li>
                            </ul>
                            
                            <h4>Game Mechanics</h4>
                            <p><strong>Deal:</strong> 4 cards showered randomly according to elements. Both players choose 1 attack.</p>
                            <p><strong>Energy System:</strong></p>
                            <ul>
                                <li><strong>Forward Moving Pushing Force:</strong> Takes most energy.</li>
                                <li><strong>Wall/Defense:</strong> Takes least energy. One-shot absorbing walls cost less but fail against continuous attacks. Permanent walls cost more.</li>
                            </ul>
                        `
                    },
                    {
                        id: "underwater",
                        title: "Underwater Quests",
                        content: `
                            <h3>Underwater Quests: Depths of Our Oceans</h3>
                            <p><strong>Platform:</strong> Mobile (iOS/Android) | <strong>Audience:</strong> Casual, Eco-conscious</p>
                            
                            <h4>Core Gameplay Loop</h4>
                            <ul class="strategy-list">
                                <li class="strategy-item"><strong>Submarine Navigation:</strong> Side-scrolling/2.5D navigation in the Indian Ocean.</li>
                                <li class="strategy-item"><strong>Pollution Avoidance:</strong> Skilled maneuvering to avoid man-made pollution. Collision causes damage/slowdown.</li>
                                <li class="strategy-item"><strong>Collectible Gathering:</strong> Treasure chests, gems (pearls/diamonds), unique marine artifacts.</li>
                            </ul>
                            
                            <h4>Mechanics</h4>
                            <p><strong>Controls:</strong> Touch-based (Movement + Boost).</p>
                            <p><strong>Hazards:</strong> Pollution, strong currents, jellyfish swarms. Rare shark encounters (avoidance only, no combat) for thrill.</p>
                            <p><strong>Atmosphere:</strong> Immersive Indian Ocean marine life (colorful fish, dolphins, turtles). Subtly highlights environmental awareness.</p>
                        `
                    },
                    {
                        id: "silent-shuriken",
                        title: "Silent Shuriken",
                        content: `
                            <h3>Silent Shuriken</h3>
                            <p class="intro-quote">"Unkillable spy. The farther he gets, the more secrets he learns."</p>
                            
                            <h4>Concept</h4>
                            <p>Cyber Ninja game. Futuristic aesthetic with anti-gravity boots to stick to walls.</p>
                            
                            <h4>Mechanics Evolution</h4>
                            <p>From "two walls" to <strong>2 permanent walls + 2 disappearing/semi-continuous walls</strong>.</p>
                            <p><strong>Movement:</strong> Swipe function. Swiping to and fro quickly allows dodging. Disappearing internal walls screw up timing, exposing player to enemies.</p>
                            <p><strong>Enemies:</strong> Come from all 4 sides shooting bullets.</p>
                            
                            <h4>Progression & Powerups</h4>
                            <p><strong>Weapons:</strong> Katana (cuts through enemies). Skills to pick locks and treasure chests.</p>
                            <p><strong>Story:</strong> Infiltrated enemy lines. Every time he is shot, he is caught, but somehow gets out again. "Unkillable spy."</p>
                        `
                    }
                ]
            },
            {
                id: "john-wick",
                title: "John Wick Project",
                content: `
                    <div class="chapter-header">
                        <h2>The Baba Yaga</h2>
                        <p class="chapter-subtitle">Action Game Design Specification</p>
                    </div>
                    <div class="page-content">
                        <p class="intro-quote">"Focus, Commitment, and Sheer Will."</p>
                        <p>This design document outlines a game capturing the visceral combat and "Gun Fu" style of the John Wick franchise.</p>
                    </div>
                `,
                children: [
                    {
                        id: "jw-mechanics-deep",
                        title: "Combat Mechanics",
                        content: `
                            <h3>Arsenal & Mechanics Deep Dive</h3>
                            
                            <div class="mechanic-detail">
                                <h4><span class="item-marker">🔪</span> Throwing Knives</h4>
                                <p>Silent, sub-weapon. Always visible on hip.</p>
                                <ul class="strategy-list">
                                    <li class="strategy-item"><strong>Auto-aim:</strong> Targets legs to slow enemies. Headshots aim for lethal damage.</li>
                                    <li class="strategy-item"><strong>Stealth Kill:</strong> One-shot backstab (neck hit animation).</li>
                                    <li class="strategy-item"><strong>Retrieval:</strong> Must walk over to recover, or limited to carry capability (2 max).</li>
                                </ul>
                            </div>

                            <div class="mechanic-detail">
                                <h4><span class="item-marker">⚔️</span> Katana (God Tier)</h4>
                                <p>Super fast animation killing everyone in 1m radius.</p>
                                <ul class="strategy-list">
                                    <li class="strategy-item"><strong>Cyclone Animation:</strong> Spins to slice multiple enemies.</li>
                                    <li class="strategy-item"><strong>Fear Effect:</strong> Enemies stop firing for 3s due to shock/gore of the kill.</li>
                                    <li class="strategy-item"><strong>Cooldown:</strong> Long reload/sheathe time (approx 45s).</li>
                                </ul>
                            </div>

                            <div class="mechanic-detail">
                                <h4><span class="item-marker">💨</span> Smoke Grenades</h4>
                                <p>Essential for close-range assassinations (1m) when outnumbered.</p>
                                <ul class="strategy-list">
                                    <li class="strategy-item"><strong>Visibility:</strong> Zero for enemies. John gets outlines at close range.</li>
                                    <li class="strategy-item"><strong>Choke Mechanic:</strong> >10s in smoke causes choking/shaky animations.</li>
                                    <li class="strategy-item"><strong>Strategy:</strong> Use to take hostages or takedown groups undetected.</li>
                                </ul>
                            </div>

                            <div class="mechanic-detail">
                                <h4><span class="item-marker">✨</span> Flashbang</h4>
                                <p>Blinds enemies (white light/bending over) for 5 seconds.</p>
                                <ul class="strategy-list">
                                    <li class="strategy-item"><strong>Defensive:</strong> Use to escape tough spots.</li>
                                    <li class="strategy-item"><strong>Immunity:</strong> John is immune if behind cover.</li>
                                </ul>
                            </div>
                            
                            <div class="mechanic-detail">
                                <h4><span class="item-marker">💥</span> Grenade Launcher</h4>
                                <p>Powerful, heavy weapon. No zoom, uses prediction aiming.</p>
                                <ul class="strategy-list">
                                    <li class="strategy-item"><strong>Animation:</strong> Unclips from back while running. Must be stationary/slow walk to aim.</li>
                                    <li class="strategy-item"><strong>Ammo:</strong> Max 2. Slow reload.</li>
                                </ul>
                            </div>
                        `
                    },
                    {
                        id: "jw-currency",
                        title: "Economy & Contracts",
                        content: `
                            <h3>The Continental Economy</h3>
                            <p class="intro-quote">"Ideally, we'd like to do business."</p>
                            
                            <h4>Gold Coins</h4>
                            <p>Universal currency for guns, suits, and favors.</p>
                            
                            <h4>Contract System</h4>
                            <p><strong>Balance:</strong> 50% of contracts advance the story (Bosses), 50% are for resources (Blueprints, Safehouses).</p>
                            
                            <h4>Revenge Arc Dynamics</h4>
                            <ul class="strategy-list">
                                <li class="strategy-item"><span class="item-marker">📉</span> <strong>Pre-Revenge:</strong> High payouts (500m) for hits.</li>
                                <li class="strategy-item"><span class="item-marker">💀</span> <strong>Post-Revenge:</strong> "Excommunicado" vibes? Contracts become scarce or high-risk.</li>
                                <li class="strategy-item"><span class="item-marker">⚠️</span> <strong>Risk:</strong> Forfeiting a level means losing equipped weapons. Must buy new ones.</li>
                            </ul>
                        `
                    }
                ]
            },
            {
                id: "teardowns",
                title: "Game Teardowns",
                content: `
                    <div class="chapter-header">
                        <span class="chapter-number">Section</span>
                        <h2 class="chapter-title">Teardowns & Analysis</h2>
                    </div>
                `,
                children: [
                    {
                        id: "gta5",
                        title: "GTA 5",
                        content: `
                            <h3>Grand Theft Auto V: Analysis</h3>
                            <p class="intro-quote">"A masterpiece of open-world game design... it's not just a game; it's a sprawling interactive world."</p>
                            
                            <h4>Why It's So Profitable</h4>
                            <ul class="strategy-list">
                                <li class="strategy-item"><span class="item-marker">💰</span> <strong>The Power of GTA Online:</strong> Persistent, engaging experience with long-term revenue streams through in-game purchases.</li>
                                <li class="strategy-item"><span class="item-marker">🌍</span> <strong>Freedom & Agency:</strong> The open world allows players to experiment and create their own fun.</li>
                                <li class="strategy-item"><span class="item-marker">🎬</span> <strong>High Production Value:</strong> Top-notch graphics, sound, and a compelling narrative with memorable protagonists.</li>
                            </ul>

                            <h4>Mobile Feasibility?</h4>
                            <p><strong>The "Needs a Decent PC" Factor:</strong> The sheer detail and complexity require processing power mobile phones can't match yet. The game file size is also impractical for mobile.</p>
                        `
                    },
                    {
                        id: "mlbb",
                        title: "Mobile Legends",
                        content: `
                            <h3>Mobile Legends: Bang Bang</h3>
                            <p class="intro-quote">"5v5 Mayhem... It's like a tug-of-war, but with heroes that have awesome powers."</p>
                            
                            <h4>Core Gameplay Loop</h4>
                            <p><strong>Goal:</strong> Smash the enemy's base ("Ancient"). Fight through three lanes, take down towers.</p>
                            <p><strong>The Jungle:</strong> Area between lanes full of monsters for extra gold and buffs. Adds a layer of strategy.</p>
                            
                            <h4>Hero Roles</h4>
                            <div class="artifacts-grid">
                                <div class="artifact-card"><span class="artifact-icon">🛡️</span><span class="artifact-name">Tanks</span></div>
                                <div class="artifact-card"><span class="artifact-icon">🏹</span><span class="artifact-name">Marksmen</span></div>
                                <div class="artifact-card"><span class="artifact-icon">🗡️</span><span class="artifact-name">Assassins</span></div>
                                <div class="artifact-card"><span class="artifact-icon">🔮</span><span class="artifact-name">Mages</span></div>
                            </div>
                            
                            <h4>Key Mechanics</h4>
                            <p><strong>Gold & Levels:</strong> Earn gold by killing minions/heroes to buy items. Level up to unlock skills.</p>
                            <p><strong>Teamwork:</strong> Ganking, pushing lanes, and taking objectives like the Lord are essential. "Teamwork Makes the Dream Work."</p>
                        `
                    },
                    {
                        id: "shadow-war",
                        title: "SHADOW OF WAR",
                        content: `
                            <h3>Middle-earth: Shadow of War</h3>
                            <p class="intro-quote">"How each encounter with a captain defines your story."</p>
                            
                            <h4>Unique Selling Points (USP)</h4>
                            <ul class="strategy-list">
                                <li class="strategy-item"><span class="item-marker">⚔️</span> <strong>Nemesis System:</strong> Captains you slay keep returning. Battle difficulty evolves with different solutions to fights.</li>
                                <li class="strategy-item"><span class="item-marker">🛠️</span> <strong>Skill Tree:</strong> deep combinations leading to amazing combat flows.</li>
                                <li class="strategy-item"><span class="item-marker">👕</span> <strong>Customization:</strong> Armor and abilities allow for a unique warrior pattern.</li>
                            </ul>
                            
                            <h4>Narrative Delivery</h4>
                            <p>Uses an already existing world (LOTR) but amplifies it by exploring history through extra quests.</p>
                        `
                    },
                    {
                        id: "subway",
                        title: "Subway Surfers",
                        content: `
                            <h3>Subway Surfers</h3>
                            <p class="intro-quote">"Run, Surf, Escape! The perfect time-killer that's easy to pick up but hard to put down."</p>
                            
                            <h4>Why It Works</h4>
                            <p><strong>Simple Controls:</strong> Swipe Left/Right/Up/Down. No complicated inputs.</p>
                            <p><strong>Visuals:</strong> Bright, colorful, graffiti-style graphics. Always moving.</p>
                            
                            <h4>Progression Loop</h4>
                            <ul class="strategy-list">
                                <li class="strategy-item"><span class="item-marker">🏃</span> <strong>High Scores:</strong> Beat personal bests and friends.</li>
                                <li class="strategy-item"><span class="item-marker">🔑</span> <strong>Unlocks:</strong> Collect coins to unlock characters and hoverboards.</li>
                                <li class="strategy-item"><span class="item-marker">🚀</span> <strong>Power-ups:</strong> Coin Magnet, 2x Multiplier, Jetpack.</li>
                            </ul>
                        `
                    },
                    {
                        id: "arknights",
                        title: "Arknights",
                        content: `
                            <h3>Arknights</h3>
                            <p class="intro-quote">"A thinking person's tower defense... post-apocalyptic, deep, and dark."</p>
                            
                            <h4>Core Idea</h4>
                            <p><strong>Tower Defense with Operators:</strong> Instead of static towers, you place characters (Operators) on specific tiles. Each has a class (Guard, Medic, Sniper, etc.).</p>
                            
                            <h4>Strategic Depth</h4>
                            <p><strong>DP Management:</strong> Deploying costs "Deployment Points". Vanguards generate DP.</p>
                            <p><strong>Map Strategy:</strong> Tiles matter. Enemy waves come on specific paths with different weaknesses.</p>
                            
                            <h4>Gacha & Progression</h4>
                            <p>Recruit Operators via Gacha. Level up and promote them (E1, E2) to unlock skills. Distinct anime-style art direction.</p>
                        `
                    }
                ]
            }
        ]
    },
    {
        id: "axion",
        title: "Axion Case Study",
        type: "chapter",
        content: `
            <div class="chapter-header">
                <span class="chapter-number">Case Study</span>
                <h2 class="chapter-title">Axion</h2>
                <p class="chapter-subtitle">Market Battleground</p>
            </div>
            <div class="content-section">
                <h3>The Competitive Landscape</h3>
                <p><strong>Product People:</strong> "Collective Intelligence" value prop.</p>
                <p><strong>Toptal:</strong> "Elite Talent Quality".</p>
            </div>
        `
    },
    {
        id: "improving-products",
        title: "Improving Existing Products",
        content: `
                    <div class="chapter-header">
                        <h2>Product Improvement Case Studies</h2>
                        <p class="chapter-subtitle">PM Lens: Analyzing and Optimizing Real-World Products</p>
                    </div>
                    <div class="page-content">
                        <h3>Uber: User Experience Optimization</h3>
                        <p>A deep dive into Uber's interface and user journey optimization strategies.</p>
                        
                        <a href="https://www.canva.com/design/DAGqvIUuWTg/l0zvNIYerL6lE5Uf0DOvEw/edit?utm_content=DAGqvIUuWTg&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton" target="_blank" class="resource-card">
                            <span class="resource-icon">🚗</span>
                            <div class="resource-info">
                                <h4>Uber Case Study Presentation</h4>
                                <p>View full analysis on Canva (Design & Strategy Breakdown)</p>
                            </div>
                        </a>
                    </div>
                `
    },
    {
        id: "ai-influencer",
        title: "AI Influencer Search",
        content: `
                    <div class="chapter-header">
                        <h2>AI Influencer Search</h2>
                        <p class="chapter-subtitle">Working AI Project</p>
                    </div>
                    <div class="page-content">
                        <p>A live platform for influencer marketing analysis & discovery.</p>
                        
                        <a href="https://ai-influencer-search.vercel.app/" target="_blank" class="resource-card">
                            <span class="resource-icon">🚀</span>
                            <div class="resource-info">
                                <h4>Live Application</h4>
                                <p>Launch ai-influencer-search.vercel.app</p>
                            </div>
                        </a>

                        <h4>Project Artifacts</h4>
                        <ul class="strategy-list">
                            <li class="strategy-item"><span class="item-marker">📄</span> Market Research Analysis</li>
                            <li class="strategy-item"><span class="item-marker">📊</span> Raw Data: Influencer Platforms</li>
                            <li class="strategy-item"><span class="item-marker">📝</span> Product Requirement Document (PRD)</li>
                        </ul>
                    </div>
                `
    },
    {
        id: "blogs",
        title: "Blogs & Articles",
        content: `
                    <div class="chapter-header">
                        <h2>Library of Thoughts</h2>
                        <p class="chapter-subtitle">Articles, Musings, and Publications</p>
                    </div>
                    <div class="page-content">
                        <ul class="blog-list">
                            <li class="blog-item">
                                <a href="https://synonymous-lute-224.notion.site/LinkedIn-blog-1ee567fe09328097ad1fd76dec36790b?pvs=25" target="_blank" class="blog-link">LinkedIn Blog Collection</a>
                                <p class="blog-meta">Collection of professional thoughts and updates.</p>
                            </li>
                            <li class="blog-item">
                                <a href="https://synonymous-lute-224.notion.site/Inspired-Today-Gone-Tomorrow-How-to-Build-Habits-That-Last-a-Lifetime-1f0567fe093280f69a5acf4ac0a81372?pvs=25" target="_blank" class="blog-link">"Inspired Today, Gone Tomorrow?"</a>
                                <p class="blog-meta">How to Build Habits That Last a Lifetime</p>
                            </li>
                        </ul>
                    </div>
                `
    }
];
