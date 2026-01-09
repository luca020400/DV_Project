import { useState, useEffect, useRef } from "react";

function Footer() {
    const [showTree, setShowTree] = useState(false);
    const [showTetris, setShowTetris] = useState(false);
    const tetrisRef = useRef(null);

    const LinkIcon = () => (
        <svg
            className="w-3 h-3 ml-1 inline-block opacity-70 group-hover:opacity-100 transition-opacity"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
    );

    const inputBufferRef = useRef("");

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (showTetris && e.key === "Escape") {
                setShowTetris(false);
                return;
            }

            // Only listen for "tetris" input if grid is expanded and game not shown
            if (!showTetris && showTree) {
                inputBufferRef.current += e.key.toLowerCase();

                // Keep only last 6 characters (length of "tetris")
                if (inputBufferRef.current.length > 6) {
                    inputBufferRef.current = inputBufferRef.current.slice(-6);
                }

                // Check if user typed "tetris"
                if (inputBufferRef.current.endsWith("tetris")) {
                    setShowTetris(true);
                    inputBufferRef.current = "";
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [showTetris, showTree]);

    // Shamelessly copied from https://gist.github.com/straker/3c98304f8a6a9174efd8292800891ea1
    useEffect(() => {
        if (!showTetris || !tetrisRef.current) return;

        // Tetris game implementation
        const canvas = tetrisRef.current;
        const context = canvas.getContext("2d");
        const grid = 32;
        const tetrominoSequence = [];

        const playfield = [];
        for (let row = -2; row < 20; row++) {
            playfield[row] = [];
            for (let col = 0; col < 10; col++) {
                playfield[row][col] = 0;
            }
        }

        const tetrominos = {
            I: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
            J: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
            L: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
            O: [[1, 1], [1, 1]],
            S: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
            Z: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
            T: [[0, 1, 0], [1, 1, 1], [0, 0, 0]]
        };

        const colors = {
            I: "cyan",
            O: "yellow",
            T: "purple",
            S: "green",
            Z: "red",
            J: "blue",
            L: "orange"
        };

        let gameOver = false;
        let rAF = null;
        let count = 0;

        function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function generateSequence() {
            const sequence = ["I", "J", "L", "O", "S", "T", "Z"];
            while (sequence.length) {
                const rand = getRandomInt(0, sequence.length - 1);
                const name = sequence.splice(rand, 1)[0];
                tetrominoSequence.push(name);
            }
        }

        function getNextTetromino() {
            if (tetrominoSequence.length === 0) {
                generateSequence();
            }
            const name = tetrominoSequence.pop();
            const matrix = tetrominos[name];
            const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);
            const row = name === "I" ? -1 : -2;
            return { name, matrix, row, col };
        }

        function rotate(matrix) {
            const N = matrix.length - 1;
            const result = matrix.map((row, i) =>
                row.map((val, j) => matrix[N - j][i])
            );
            return result;
        }

        function isValidMove(matrix, cellRow, cellCol) {
            for (let row = 0; row < matrix.length; row++) {
                for (let col = 0; col < matrix[row].length; col++) {
                    if (
                        matrix[row][col] &&
                        (cellCol + col < 0 ||
                            cellCol + col >= playfield[0].length ||
                            cellRow + row >= playfield.length ||
                            playfield[cellRow + row][cellCol + col])
                    ) {
                        return false;
                    }
                }
            }
            return true;
        }

        function placeTetromino() {
            for (let row = 0; row < tetromino.matrix.length; row++) {
                for (let col = 0; col < tetromino.matrix[row].length; col++) {
                    if (tetromino.matrix[row][col]) {
                        if (tetromino.row + row < 0) {
                            showGameOver();
                            return;
                        }
                        playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
                    }
                }
            }

            for (let row = playfield.length - 1; row >= 0;) {
                if (playfield[row].every(cell => !!cell)) {
                    for (let r = row; r >= 0; r--) {
                        for (let c = 0; c < playfield[r].length; c++) {
                            playfield[r][c] = playfield[r - 1][c];
                        }
                    }
                } else {
                    row--;
                }
            }

            tetromino = getNextTetromino();
        }

        function showGameOver() {
            cancelAnimationFrame(rAF);
            gameOver = true;

            context.fillStyle = "black";
            context.globalAlpha = 0.75;
            context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);

            context.globalAlpha = 1;
            context.fillStyle = "white";
            context.font = "36px monospace";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText("GAME OVER!", canvas.width / 2, canvas.height / 2);
        }

        let tetromino = getNextTetromino();

        function loop() {
            rAF = requestAnimationFrame(loop);
            context.clearRect(0, 0, canvas.width, canvas.height);

            for (let row = 0; row < 20; row++) {
                for (let col = 0; col < 10; col++) {
                    if (playfield[row][col]) {
                        const name = playfield[row][col];
                        context.fillStyle = colors[name];
                        context.fillRect(col * grid, row * grid, grid - 1, grid - 1);
                    }
                }
            }

            if (tetromino) {
                if (++count > 35) {
                    tetromino.row++;
                    count = 0;

                    if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
                        tetromino.row--;
                        placeTetromino();
                    }
                }

                context.fillStyle = colors[tetromino.name];

                for (let row = 0; row < tetromino.matrix.length; row++) {
                    for (let col = 0; col < tetromino.matrix[row].length; col++) {
                        if (tetromino.matrix[row][col]) {
                            context.fillRect(
                                (tetromino.col + col) * grid,
                                (tetromino.row + row) * grid,
                                grid - 1,
                                grid - 1
                            );
                        }
                    }
                }
            }
        }

        const handleKeyDown = (e) => {
            if (gameOver) return;

            // Arrow keys controls
            if (e.which === 37 || e.which === 39) {
                const col = e.which === 37 ? tetromino.col - 1 : tetromino.col + 1;
                if (isValidMove(tetromino.matrix, tetromino.row, col)) {
                    tetromino.col = col;
                }
            }

            if (e.which === 38) {
                const matrix = rotate(tetromino.matrix);
                if (isValidMove(matrix, tetromino.row, tetromino.col)) {
                    tetromino.matrix = matrix;
                }
            }

            if (e.which === 40) {
                const row = tetromino.row + 1;
                if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
                    tetromino.row = row - 1;
                    placeTetromino();
                    return;
                }
                tetromino.row = row;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        rAF = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(rAF);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [showTetris]);

    return (
        <footer className="py-12 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 dark:from-gray-800 to-gray-100 dark:to-gray-900 transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

                    <div className="text-center md:text-left">
                        <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100 tracking-tight">
                            Data Visualization Project
                        </h3>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                Academic year 2025/2026
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                                University of Genoa
                            </p>
                        </div>
                    </div>

                    <div className="text-center md:text-right">
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                            <button
                                onClick={() => setShowTree(!showTree)}
                                className={`
                                    group relative inline-flex items-center gap-2 px-3 py-1 rounded-full
                                    transition-all duration-300 ease-in-out
                                    ${showTree
                                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20"
                                        : "hover:bg-gray-200 dark:hover:bg-gray-700"}
                                `}
                            >
                                <span>Luca Stefani</span>
                                <span className={`text-xs transition-transform duration-300 ${showTree ? "rotate-180" : ""}`}>
                                    ▼
                                </span>
                            </button>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-mono">
                            Student ID: S5163797
                        </p>
                    </div>
                </div>

                <div
                    className={`
                        grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                        ${showTree ? "grid-rows-[1fr] opacity-100 mt-8" : "grid-rows-[0fr] opacity-0 mt-0"}
                    `}
                >
                    <div className="overflow-hidden">
                        <div className="p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm max-w-lg mx-auto">

                            <div className="flex flex-col items-center">
                                {/* Root Node */}
                                <div className="flex flex-col items-center z-10 relative">
                                    <span className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg font-semibold shadow-sm border border-red-200 dark:border-red-800 flex items-center gap-2">
                                        🎴 Scala 40
                                    </span>
                                    {/* Small vertical line directly under root */}
                                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                                </div>

                                {/* Connector Lines Container */}
                                <div className="relative w-full h-4 mb-0">
                                    {/* Horizontal bar spanning from center of first child to center of last child (16.66% to 83.33%) */}
                                    <div className="absolute top-0 h-px bg-gray-300 dark:bg-gray-600 left-[16.66%] right-[16.66%]"></div>

                                    {/* Vertical ticks dropping to children */}
                                    <div className="absolute top-0 h-full w-px bg-gray-300 dark:bg-gray-600 left-[16.66%]"></div>
                                    <div className="absolute top-0 h-full w-px bg-gray-300 dark:bg-gray-600 left-1/2 -translate-x-1/2"></div>
                                    <div className="absolute top-0 h-full w-px bg-gray-300 dark:bg-gray-600 right-[16.66%]"></div>
                                </div>

                                {/* Children Nodes Container */}
                                <div className="flex justify-between w-full text-xs sm:text-sm">

                                    {/* Child 1: Luca (Burraco) */}
                                    <div className="flex flex-col items-center flex-1 basis-0">
                                        <div className="p-2 w-[90%] text-center bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md border border-green-200 dark:border-green-800 shadow-sm">
                                            🍃 Burraco
                                        </div>
                                        <div className="h-3 w-px border-l border-dashed border-gray-400 dark:border-gray-500"></div>
                                        <span
                                            className="px-2 py-0.5 bg-gradient-to-r from-pink-500 from-0% via-purple-500 via-25% to-green-500 to-100% text-white text-[10px] uppercase tracking-wider font-bold rounded-full hover:opacity-80 transition-opacity group relative overflow-hidden"
                                        >
                                            Luca
                                        </span>
                                    </div>

                                    {/* Child 2: Kevin (Macchiavelli) */}
                                    <div className="flex flex-col items-center flex-1 basis-0">
                                        <div className="p-2 w-[90%] text-center bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-md border border-purple-200 dark:border-purple-800 shadow-sm">
                                            🃏 Macchiavelli
                                        </div>
                                        <div className="h-3 w-px border-l border-dashed border-gray-400 dark:border-gray-500"></div>
                                        <a
                                            href="https://kevinnetti.github.io/ProjectDV/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center px-2 py-0.5 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 text-[10px] uppercase tracking-wider font-bold rounded-full hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
                                        >
                                            Kevin <LinkIcon />
                                        </a>
                                    </div>

                                    {/* Child 3: Matteo (Cirulla) */}
                                    <div className="flex flex-col items-center flex-1 basis-0">
                                        <div className="p-2 w-[90%] text-center bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-md border border-yellow-200 dark:border-yellow-800 shadow-sm">
                                            🌾 Cirulla
                                        </div>
                                        <div className="h-3 w-px border-l border-dashed border-gray-400 dark:border-gray-500"></div>
                                        <a
                                            href="https://matteogrifone22.github.io/Data-Visualization-Project/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center px-2 py-0.5 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 text-[10px] uppercase tracking-wider font-bold rounded-full hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
                                        >
                                            Matteo <LinkIcon />
                                        </a>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tetris Modal */}
            {showTetris && (
                <div
                    className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
                    onClick={() => setShowTetris(false)}
                >
                    <div
                        className="relative flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <canvas
                            ref={tetrisRef}
                            width="320"
                            height="640"
                            className="border-2 border-white shadow-lg"
                        />
                        <p className="text-white text-sm mt-4">
                            Arrow Keys to Move/Rotate • Down to Drop • ESC to Exit
                        </p>
                    </div>
                </div>
            )}
        </footer>
    );
}

export default Footer;