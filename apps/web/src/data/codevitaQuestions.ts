import type { RawQuestion } from './mockQuestions';

export const codevitaQuestions: RawQuestion[] = [
  // ─── GRAPH & GEOMETRY (7) ───
  {
    id:1, cat:'geo', diff:'easy',
    text:'In BFS on an unweighted graph, which data structure is used to track the traversal order?',
    options:['Stack','Queue','Priority Queue','Deque'],
    answer:1,
    explanation:'BFS uses a Queue (FIFO). Stack is used for DFS. Priority Queue is used for Dijkstra\'s algorithm.'
  },
  {
    id:2, cat:'geo', diff:'medium',
    text:'The "Desert Queen" problem on CodeVita maps a grid where moving across Desert or Mountain cells costs 1 unit of water, but consecutive Train-track cells cost 0. Which algorithm handles this variable-weight shortest path most efficiently?',
    options:['Standard BFS','Floyd-Warshall','0-1 BFS or modified Dijkstra\'s','Bellman-Ford'],
    answer:2,
    explanation:'When edge weights are 0 or 1, 0-1 BFS (using a deque) handles it in O(V+E). Modified Dijkstra\'s also works. The variable weights disqualify plain BFS.'
  },
  {
    id:3, cat:'geo', diff:'medium',
    text:'A bug starts at vertical offset h1 on a cylinder of radius r and height h. The destination is at angle θ° and vertical distance h2. What is the most efficient way to find the shortest surface path?',
    options:['Generate a grid graph and run Dijkstra\'s','Unroll the cylinder into a 2D rectangle and compute Euclidean distance','Use DFS with coordinate state tracking','Apply A* search with Manhattan distance heuristic'],
    answer:1,
    explanation:'Unrolling the cylinder into a 2D flat rectangle converts the 3D surface path into a straight-line Pythagorean calculation — O(1) time, no graph needed.'
  },
  {
    id:4, cat:'geo', diff:'hard',
    text:'In the "On A Cube" problem, a beetle traverses honey spots on a 10×10×10 cm cube. Movement across a single face follows a 60° arc; cross-face movement uses shortest Euclidean path. The bottom face (z=0) and all edges are forbidden. What projection technique is required?',
    options:['Polar coordinate transformation','3D-to-2D net unfolding with Cartesian vector projection','BFS on adjacency matrix of face-center nodes','Dynamic programming over 3D state space'],
    answer:1,
    explanation:'The cube must be unfolded into a 2D net. 3D coordinates are projected onto this net, and Euclidean distances are computed using floating-point arithmetic. Boundary conditions must explicitly prohibit z=0 traversal.'
  },
  {
    id:5, cat:'geo', diff:'medium',
    text:'In a graph traversal problem, you need to avoid infinite recursion when DFS backtracks. What is the standard mechanism?',
    options:['Use a priority queue to order visits','Maintain a boolean "visited" array or hash set per state','Clear the adjacency list after each traversal','Sort nodes by degree before visiting'],
    answer:1,
    explanation:'A visited array (or hash set for complex states) marks explored nodes. Without it, DFS can cycle forever in graphs with cycles.'
  },
  {
    id:6, cat:'geo', diff:'easy',
    text:'Dijkstra\'s algorithm finds the shortest path in a weighted graph. What is its time complexity when using a binary min-heap?',
    options:['O(V²)','O(E log V)','O(V log V)','O(V + E)'],
    answer:1,
    explanation:'With a binary heap (priority queue), each edge relaxation costs O(log V), and there are E edges: O(E log V). Plain array gives O(V²).'
  },
  {
    id:7, cat:'geo', diff:'hard',
    text:'In the "Obstacle Game" problem, a route is plotted through a grid while parsing surrounding hazards (Stones, Walls, Water, Thorns) sorted by danger value at each cell. What is the dominant complexity if the grid is R×C with K hazard types?',
    options:['O(R × C)','O(R × C × log K)','O(K²)','O(R + C)'],
    answer:1,
    explanation:'At each of the R×C cells, a neighborhood is scanned and K hazards are sorted — O(K log K). Total complexity: O(R × C × log K).'
  },

  // ─── DYNAMIC PROGRAMMING (8) ───
  {
    id:8, cat:'dp', diff:'easy',
    text:'The Longest Common Subsequence (LCS) of two strings of lengths M and N is computed using:',
    options:['1D array in O(N)','2D tabulation matrix in O(M × N)','Sorting both strings in O(N log N)','Hash map in O(N)'],
    answer:1,
    explanation:'LCS uses a 2D DP table where dp[i][j] stores the LCS length of the first i characters of string 1 and first j characters of string 2. Time: O(M × N).'
  },
  {
    id:9, cat:'dp', diff:'medium',
    text:'In the "Minimize the Sum" problem, you can replace any array element with floor(arr[i]/2) up to K times, aiming to minimize the total sum. What data structure yields the optimal O(K log N) solution?',
    options:['Sorted array with binary search','Max-Heap (Priority Queue)','Hash Map of frequencies','2D DP table'],
    answer:1,
    explanation:'Always halving the current maximum is the greedy-optimal strategy. A max-heap extracts the largest element in O(log N), halves it, and re-inserts — K times total: O(K log N).'
  },
  {
    id:10, cat:'dp', diff:'medium',
    text:'The 0/1 Knapsack problem with N items and weight capacity W has time complexity:',
    options:['O(N log W)','O(N × W)','O(2^N)','O(N + W)'],
    answer:1,
    explanation:'The standard 2D DP table has N rows (items) and W columns (capacities). Each cell is computed in O(1): total O(N × W).'
  },
  {
    id:11, cat:'dp', diff:'hard',
    text:'In the "Coins Distribution" CodeVita problem, you must use denominations {1, 2, 5} to represent every integer from 1 to N while keeping the total absolute coin pool ≤ N. This blends which two paradigms?',
    options:['Greedy only','Sieve of Eratosthenes + BFS','Modified Knapsack DP + greedy heuristic checking','Divide-and-conquer + memoization'],
    answer:2,
    explanation:'The problem requires minimizing coins (Knapsack/partition DP) while enforcing a coverage constraint that requires real-time greedy validation. A pure greedy or pure DP approach alone will fail edge cases.'
  },
  {
    id:12, cat:'dp', diff:'medium',
    text:'Bottom-up DP for the nth Fibonacci number avoids stack overflow and runs in:',
    options:['O(2^N) with memoization','O(N) time, O(N) space for full array','O(N) time, O(1) space using two variables','O(log N) via matrix exponentiation'],
    answer:2,
    explanation:'Bottom-up tabulation iterates from F(0) to F(N) storing only the previous two values, achieving O(N) time and O(1) space. Matrix exponentiation achieves O(log N) but is rarely needed.'
  },
  {
    id:13, cat:'dp', diff:'hard',
    text:'The "Consecutive Prime Sum" problem requires finding primes expressible as a sum of consecutive smaller primes. Why does a naive nested loop approach fail on CodeVita?',
    options:['It produces wrong answers due to floating-point errors','Nested loops produce O(N²) complexity, violating the 1–2 second time limit','Hash maps cannot store prime sequences','Prime generation is not possible in Python'],
    answer:1,
    explanation:'Without prefix sums, checking all contiguous sub-arrays of primes is O(N²). The Sieve of Eratosthenes generates primes in O(N log log N), and a prefix sum array reduces sub-array sum queries to O(1), making the whole solution O(N log log N).'
  },
  {
    id:14, cat:'dp', diff:'easy',
    text:'The Subset Sum problem asks: can a subset of array elements sum to target T? The DP state is:',
    options:['dp[i] = maximum sum using i elements','dp[i][j] = true if sum j is achievable using first i elements','dp[i] = number of subsets summing to i','dp[i][j] = minimum elements to reach sum j'],
    answer:1,
    explanation:'dp[i][j] is true if a subset of the first i elements sums to j. Transition: dp[i][j] = dp[i-1][j] OR dp[i-1][j - arr[i-1]].'
  },
  {
    id:15, cat:'dp', diff:'medium',
    text:'A sliding window technique is best applied when:',
    options:['Finding the maximum of all sub-arrays of fixed length K','Computing all pairwise distances in a graph','Sorting a nearly-sorted array','Finding prime factors of a large number'],
    answer:0,
    explanation:'A sliding window of size K slides across the array once: O(N). For variable-size windows (like consecutive prime sums), prefix sums allow O(1) range queries.'
  },

  // ─── GREEDY (7) ───
  {
    id:16, cat:'greedy', diff:'easy',
    text:'The "Minimum Gifts" problem: employees in a line receive gifts. Higher-ranked neighbours must get more gifts. Minimum gifts with at least 1 per person. What is the optimal approach?',
    options:['Repeat array scans until stable — O(N²)','Two linear passes: left-to-right, then right-to-left — O(N)','Sort employees by rank first — O(N log N)','BFS from highest-ranked employee — O(V+E)'],
    answer:1,
    explanation:'Left-to-right pass handles the left-neighbour constraint. Right-to-left pass handles the right-neighbour constraint, taking the max of the two directional states. Result: O(N) time.'
  },
  {
    id:17, cat:'greedy', diff:'medium',
    text:'The "Seating Arrangement" problem: given a string of "O" (occupied) and "E" (empty) seats, find the minimum swaps to cluster all occupied seats together. The optimal greedy insight is:',
    options:['Sort all positions and compute inversions','Find the median position of all occupied seats and compute total distance to it','Use BFS to find shortest rearrangement path','Count occupied pairs and divide by 2'],
    answer:1,
    explanation:'The minimum-cost gathering point for a set of positions on a line is always the median. Summing absolute distances from each occupied seat to the median gives the minimum swap count.'
  },
  {
    id:18, cat:'greedy', diff:'medium',
    text:'The "Railway Station" problem: N trains with arrival and departure times. Find the minimum platforms needed. Which algorithmic pattern solves this?',
    options:['Sort trains by duration, greedily assign platforms','Sort arrivals and departures independently; use a two-pointer counter','Build an interval tree and count overlaps','Graph coloring with N nodes'],
    answer:1,
    explanation:'Sort both arrival and departure arrays. Use two pointers: increment a counter on arrival, decrement on departure. Track the historical maximum. Time: O(N log N).'
  },
  {
    id:19, cat:'greedy', diff:'hard',
    text:'The "Sorting Boxes" problem: sort boxes by weight using swaps, where each swap costs product of the two box weights. The absolute heaviest must end at index k. What is the key insight for minimum total cost?',
    options:['Always swap the heaviest with its target position directly','Decompose the permutation into disjoint cycles; for each cycle evaluate whether to resolve internally or borrow the global minimum as a pivot','Apply merge sort to minimize the number of swaps','Use a min-heap to always swap the two lightest elements'],
    answer:1,
    explanation:'Cycle decomposition is the optimal approach. For a cycle, you can sort it using (cycle_length - 1) swaps of the cycle\'s minimum, OR bring in the global minimum for (cycle_length + 1) swaps at lower multiplicative cost if the global minimum is cheaper.'
  },
  {
    id:20, cat:'greedy', diff:'easy',
    text:'A greedy algorithm is correct when:',
    options:['It always finds the exact globally optimal solution by local choices','It uses memoization to avoid recomputation','It processes elements in random order','It always runs in O(N²) time'],
    answer:0,
    explanation:'A greedy algorithm works when the problem has the "greedy choice property" — local optimal choices lead to a global optimum — and "optimal substructure". Not all problems have these properties.'
  },
  {
    id:21, cat:'greedy', diff:'medium',
    text:'The WeaponBoxes problem uses cyclical deque manipulation. Which operation makes a deque more efficient than a standard queue for this type of problem?',
    options:['O(1) random access by index','O(1) insertion and deletion from both ends','O(log N) search by value','Automatic duplicate removal'],
    answer:1,
    explanation:'A deque (double-ended queue) supports O(1) push/pop from both front and back, making it ideal for cyclical array manipulation where elements may be extracted from either end.'
  },
  {
    id:22, cat:'greedy', diff:'hard',
    text:'In the interval scheduling problem, to maximize the number of non-overlapping intervals selected from N intervals, the correct greedy strategy is:',
    options:['Sort by start time, always pick the earliest start','Sort by end time, always pick the earliest-finishing non-overlapping interval','Sort by duration, pick the shortest intervals first','Sort by start time, use DP on overlapping sub-problems'],
    answer:1,
    explanation:'Sorting by end time and greedily selecting the earliest-ending non-overlapping interval maximizes the count. This is a classic proof-by-exchange argument.'
  },

  // ─── NUMBER THEORY & MATH (7) ───
  {
    id:23, cat:'math', diff:'easy',
    text:'The Sieve of Eratosthenes generates all primes up to N in:',
    options:['O(N)','O(N log log N)','O(N log N)','O(√N)'],
    answer:1,
    explanation:'The Sieve crosses out multiples of each prime. The total work is N/2 + N/3 + N/5 + ... ≈ N log log N by Mertens\' theorem.'
  },
  {
    id:24, cat:'math', diff:'medium',
    text:'A "square-free" number has no perfect square (other than 1) as a divisor. If N has exactly K distinct prime factors, how many square-free divisors does N have?',
    options:['K!','2^K','2^K − 1','K × (K−1)/2'],
    answer:2,
    explanation:'Each square-free divisor is a product of a subset of N\'s distinct prime factors. There are 2^K subsets total, but the empty subset gives 1 (excluded if asking for divisors > 1), so 2^K − 1 non-trivial square-free divisors.'
  },
  {
    id:25, cat:'math', diff:'medium',
    text:'The kth Largest Factor of N problem avoids O(N) iteration by:',
    options:['Using a hash map to count frequency of each factor','Iterating only up to √N and collecting paired divisors','Applying Euler\'s totient function','Running a prime sieve up to N/2'],
    answer:1,
    explanation:'For any divisor d ≤ √N, N/d is also a divisor. Collecting both in a sorted list while iterating to √N gives all divisors in O(√N) time.'
  },
  {
    id:26, cat:'math', diff:'hard',
    text:'The "Date Time" CodeVita problem gives 12 digits (0-9) and asks for the latest valid datetime in MM/DD HH:MM format using each digit exactly once. What makes this computationally hard?',
    options:['Large prime factorization requirement','Cascading calendar constraints: month ≤ 12, day depends on month (28/30/31), hours 00–23, minutes 00–59','Requires O(N!) permutation search of all digit orderings','The digits must be sorted before assignment'],
    answer:1,
    explanation:'The constraint web is deeply interdependent: the month determines valid day range; hours must be 0-23, minutes 0-59. A constrained backtracking or greedy permutation builder must handle all cascading calendar rules.'
  },
  {
    id:27, cat:'math', diff:'easy',
    text:'What does modular arithmetic primarily help with in competitive programming?',
    options:['Reducing floating-point errors','Keeping large number computations within fixed integer bounds','Speeding up prime generation','Enabling negative number operations'],
    answer:1,
    explanation:'Modular arithmetic (a mod M) ensures results stay within a fixed range, preventing integer overflow. It\'s used in combinatorics, hashing, and number theory problems with very large outputs.'
  },
  {
    id:28, cat:'math', diff:'medium',
    text:'To compute C(N, K) mod P (binomial coefficient) efficiently for large N, K, which technique is most appropriate when P is prime?',
    options:['Direct division: C(N,K) = N! / (K! × (N-K)!)','Lucas\' theorem for prime moduli','Sieve of Eratosthenes pre-computation','Binary search on factorials'],
    answer:1,
    explanation:'For prime P, Lucas\' theorem recursively decomposes C(N,K) into products of smaller binomial coefficients mod P, enabling efficient computation even for huge N.'
  },
  {
    id:29, cat:'math', diff:'hard',
    text:'The "Prime Time Again" problem partitions a day into P equal sectors and counts how many sector-hour intersections align with prime numbers. If there are H hours total, the complexity is:',
    options:['O(H)','O(P × H)','O(H log H)','O(P log P)'],
    answer:1,
    explanation:'For each of P partitions, each mapped hour must be prime-checked: O(P × H). Pre-computing primes up to H with the Sieve reduces per-check cost to O(1), keeping total at O(P × H).'
  },

  // ─── STRING & MATRIX (6) ───
  {
    id:30, cat:'str', diff:'easy',
    text:'The Knuth-Morris-Pratt (KMP) algorithm finds a pattern of length M in a text of length N in:',
    options:['O(M × N)','O(N + M)','O(N log M)','O(M²)'],
    answer:1,
    explanation:'KMP pre-processes the pattern in O(M) using a failure function, then scans the text in O(N), never re-reading characters. Total: O(N + M).'
  },
  {
    id:31, cat:'str', diff:'medium',
    text:'The "Constellation" CodeVita problem searches a 3×N character matrix for vowel-shaped (*) patterns. This is fundamentally:',
    options:['A substring search problem solvable with KMP','A 2D spatial convolution / sliding mask problem over a character matrix','A BFS traversal of connected * regions','An anagram detection problem using ASCII frequencies'],
    answer:1,
    explanation:'Each vowel shape is encoded as a 2D bitmask. The mask slides across the 3×N matrix checking for spatial match — this is 2D convolution / template matching, not a 1D string operation.'
  },
  {
    id:32, cat:'str', diff:'medium',
    text:'The "String Pair" problem: convert integers to English words, count vowels (sum = D), then count array pairs summing to D. The two-sum component is optimally solved using:',
    options:['Sorting + binary search: O(N log N)','Hash map for O(N) two-sum lookup','Nested loops: O(N²)','Bit manipulation: O(N)'],
    answer:1,
    explanation:'Store each number in a hash map as you iterate. For each element x, check if (D - x) exists in the map. This gives O(N) average-case complexity.'
  },
  {
    id:33, cat:'str', diff:'hard',
    text:'The "Greedy Hostel Owner" problem uses a context-sensitive cipher (e.g., "J" maps to 0 if followed by "A", else 9). Parsing this requires:',
    options:['Regular expression back-references','A finite-state machine (FSM) that reads one character ahead','A stack-based parser for nested rules','Binary search over the character table'],
    answer:1,
    explanation:'Context-dependent character translation requires knowing the next character before resolving the current one. An FSM with lookahead (or simple peek-forward) elegantly handles this in O(N).'
  },
  {
    id:34, cat:'str', diff:'easy',
    text:'To check if two strings are anagrams of each other, the most space-efficient approach is:',
    options:['Sort both strings and compare — O(N log N) time, O(N) space','Use a frequency array of size 26 — O(N) time, O(1) space','Hash map of characters — O(N) time, O(N) space','Trie comparison — O(N) time, O(N) space'],
    answer:1,
    explanation:'For lowercase ASCII, a fixed-size array of 26 integers counts character frequencies. Increment for string 1, decrement for string 2. If all zeros, they\'re anagrams. O(N) time, O(1) space.'
  },
  {
    id:35, cat:'str', diff:'medium',
    text:'In the "Valid Palindromes" CodeVita variant, wildcard blanks can be filled to force a palindrome. The core algorithm counts:',
    options:['Minimum character deletions to make the string a palindrome (LCS-based)','Number of mismatched position pairs from both ends that each require one fill','Hash map of character frequencies with odd counts','Number of distinct substrings using suffix arrays'],
    answer:1,
    explanation:'Scanning from both ends: for each mismatch, one wildcard fills the gap. The count of such mismatch pairs gives the minimum blanks needed. O(N) time, O(1) extra space.'
  },

  // ─── SIMULATION (5) ───
  {
    id:36, cat:'sim', diff:'medium',
    text:'In "Sai\'s Mini Project" (banking simulation), the "rollback X" command reverts balance to its state after the X-th commit. What data structure stores historical committed states?',
    options:['A single integer variable updated on each commit','A parallel array indexed by commit number storing the balance snapshot at each commit','A min-heap of transaction amounts','A circular buffer of the last 10 transactions'],
    answer:1,
    explanation:'A rollback operation requires indexed access to historical balances. A parallel array where index corresponds to commit number, storing the balance snapshot at that commit, enables O(1) rollback lookup.'
  },
  {
    id:37, cat:'sim', diff:'medium',
    text:'In "Sai\'s Mini Project", an "abort X" command cancels a transaction that has NOT yet been committed. Which state tracking makes this validation correct?',
    options:['Check if transaction X was created before the last credit operation','Maintain a boolean "committed" flag per transaction; abort fails if flag is true','Use a timestamp comparison between transaction X and the last commit','Count total transactions; abort if X > current count'],
    answer:1,
    explanation:'Each transaction object carries a committed flag. Abort checks this flag — if true, the transaction is locked and cannot be cancelled. This requires OOP-style transaction state objects.'
  },
  {
    id:38, cat:'sim', diff:'hard',
    text:'The "Civil War" simulation: Captain America and Iron Man alternately draft Avengers from either end of a linear array to maximize their power differential. Both play optimally. This is:',
    options:['A standard greedy problem solvable by always taking the larger end value','A game-theory problem requiring Minimax or DP over sub-array states','A BFS problem on the array state space','A prime-sum problem in disguise'],
    answer:1,
    explanation:'Both players play optimally and adversarially. Minimax (or interval DP where dp[l][r] = best score achievable from subarray [l..r] for the current player) is required. Greedy fails because the opponent\'s optimal counter-play must be modeled.'
  },
  {
    id:39, cat:'sim', diff:'medium',
    text:'The "Election" simulation: A, B, and Neutral voters are adjacent in a queue. Each step, adjacent Supporters convert Neutral voters. This is a:',
    options:['Graph shortest path problem','Cellular automaton / influence propagation simulation','Modular arithmetic sequence','String palindrome check'],
    answer:1,
    explanation:'Each cell\'s next state depends on its current neighbours — exactly the cellular automaton model. Simulating step-by-step with a queue or array update propagates influence until convergence.'
  },
  {
    id:40, cat:'sim', diff:'hard',
    text:'The "ROI" (Return on Investment) simulation computes both Realized P&L (sold stocks) and Unrealized P&L (still held, evaluated at a given time T). If Time of Sell = 0, the asset is still active. The primary challenge is:',
    options:['Sorting stocks by purchase price to find the minimum basis','Cross-referencing multi-dimensional purchase/sell tuples against a temporal price array with precise float formatting','Finding the prime factorization of stock quantities','Using BFS to find the longest holding period'],
    answer:1,
    explanation:'Stocks are tuples of (quantity, buy_time, sell_time). Each tuple must be cross-referenced against a 2D price-vs-time array. Active stocks use the price at time T. Inactive stocks use their sell-time price. Precision float formatting is critical for correct output.'
  }
];
