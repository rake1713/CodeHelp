from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from problems.models import Category, Problem, TestCase


SEED_DATA = [
    {
        "name": "Arrays",
        "description": "Tasks on working with arrays and lists",
        "problems": [
            {
                "title": "Two Sum",
                "difficulty": "Easy",
                "description": (
                    "Given an array of integers `nums` and an integer `target`, "
                    "return the indices of the two numbers that add up to `target`.\n\n"
                    "You may assume that each input has exactly one solution, and you may not use the same element twice."
                ),
                "input_example": "nums = [2, 7, 11, 15], target = 9",
                "output_example": "[0, 1]",
                "test_cases": [
                    {"input": "2 7 11 15\n9", "output": "0 1"},
                    {"input": "3 2 4\n6", "output": "1 2"},
                    {"input": "3 3\n6", "output": "0 1", "hidden": False},
                ],
            },
            {
                "title": "Maximum Subarray Sum",
                "difficulty": "Easy",
                "description": (
                    "Given an integer array `nums`, find the subarray with the largest sum and return its sum.\n\n"
                    "A subarray is a contiguous part of an array."
                ),
                "input_example": "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]",
                "output_example": "6",
                "test_cases": [
                    {"input": "-2 1 -3 4 -1 2 1 -5 4", "output": "6"},
                    {"input": "1", "output": "1"},
                    {"input": "5 4 -1 7 8", "output": "23", "hidden": False},
                ],
            },
            {
                "title": "Product of Array Except Self",
                "difficulty": "Medium",
                "description": (
                    "Given an integer array `nums`, return an array `answer` such that `answer[i]` "
                    "is equal to the product of all the elements of `nums` except `nums[i]`.\n\n"
                    "You must solve it without using the division operation and in O(n) time."
                ),
                "input_example": "nums = [1, 2, 3, 4]",
                "output_example": "[24, 12, 8, 6]",
                "test_cases": [
                    {"input": "1 2 3 4", "output": "24 12 8 6"},
                    {"input": "-1 1 0 -3 3", "output": "0 0 9 0 0"},
                ],
            },
            {
                "title": "Find All Duplicates",
                "difficulty": "Medium",
                "description": (
                    "Given an integer array `nums` of length n where all integers are in the range [1, n] "
                    "and each integer appears once or twice, return an array of all integers that appear twice.\n\n"
                    "You must run in O(n) time and use only O(1) extra space."
                ),
                "input_example": "nums = [4, 3, 2, 7, 8, 2, 3, 1]",
                "output_example": "[2, 3]",
                "test_cases": [
                    {"input": "4 3 2 7 8 2 3 1", "output": "2 3"},
                    {"input": "1 1 2", "output": "1"},
                    {"input": "1", "output": "", "hidden": False},
                ],
            },
            {
                "title": "Median of Two Sorted Arrays",
                "difficulty": "Hard",
                "description": (
                    "Given two sorted arrays `nums1` and `nums2` of sizes m and n, "
                    "return the median of the two sorted arrays.\n\n"
                    "The overall run time complexity should be O(log(m+n))."
                ),
                "input_example": "nums1 = [1, 3], nums2 = [2]",
                "output_example": "2.0",
                "test_cases": [
                    {"input": "1 3\n2", "output": "2.0"},
                    {"input": "1 2\n3 4", "output": "2.5"},
                ],
            },
            {
                "title": "Largest Rectangle in Histogram",
                "difficulty": "Hard",
                "description": (
                    "Given an array of integers `heights` representing the histogram's bar heights "
                    "where the width of each bar is 1, return the area of the largest rectangle in the histogram."
                ),
                "input_example": "heights = [2, 1, 5, 6, 2, 3]",
                "output_example": "10",
                "test_cases": [
                    {"input": "2 1 5 6 2 3", "output": "10"},
                    {"input": "2 4", "output": "4"},
                ],
            },
        ],
    },
    {
        "name": "Strings",
        "description": "Tasks on string manipulation and pattern matching",
        "problems": [
            {
                "title": "Valid Palindrome",
                "difficulty": "Easy",
                "description": (
                    "A phrase is a palindrome if, after converting all uppercase letters to lowercase "
                    "and removing all non-alphanumeric characters, it reads the same forward and backward.\n\n"
                    "Given a string `s`, return `true` if it is a palindrome, or `false` otherwise."
                ),
                "input_example": 's = "A man, a plan, a canal: Panama"',
                "output_example": "true",
                "test_cases": [
                    {"input": "A man, a plan, a canal: Panama", "output": "true"},
                    {"input": "race a car", "output": "false"},
                    {"input": " ", "output": "true", "hidden": False},
                ],
            },
            {
                "title": "Reverse Words in a String",
                "difficulty": "Easy",
                "description": (
                    "Given an input string `s`, reverse the order of the words.\n\n"
                    "A word is defined as a sequence of non-space characters. "
                    "Return a string of the words in reverse order concatenated by a single space."
                ),
                "input_example": 's = "the sky is blue"',
                "output_example": '"blue is sky the"',
                "test_cases": [
                    {"input": "the sky is blue", "output": "blue is sky the"},
                    {"input": "  hello world  ", "output": "world hello"},
                ],
            },
            {
                "title": "Longest Substring Without Repeating Characters",
                "difficulty": "Medium",
                "description": (
                    "Given a string `s`, find the length of the longest substring without repeating characters."
                ),
                "input_example": 's = "abcabcbb"',
                "output_example": "3",
                "test_cases": [
                    {"input": "abcabcbb", "output": "3"},
                    {"input": "bbbbb", "output": "1"},
                    {"input": "pwwkew", "output": "3"},
                ],
            },
            {
                "title": "Group Anagrams",
                "difficulty": "Medium",
                "description": (
                    "Given an array of strings `strs`, group the anagrams together. "
                    "You can return the answer in any order.\n\n"
                    "An anagram is a word formed by rearranging the letters of a different word, "
                    "using all the original letters exactly once."
                ),
                "input_example": 'strs = ["eat","tea","tan","ate","nat","bat"]',
                "output_example": '[["bat"],["nat","tan"],["ate","eat","tea"]]',
                "test_cases": [
                    {"input": "eat tea tan ate nat bat", "output": "bat nat tan ate eat tea"},
                    {"input": "", "output": ""},
                ],
            },
            {
                "title": "Regular Expression Matching",
                "difficulty": "Hard",
                "description": (
                    "Given an input string `s` and a pattern `p`, implement regular expression matching "
                    "with support for '.' and '*' where:\n"
                    "- '.' matches any single character.\n"
                    "- '*' matches zero or more of the preceding element.\n\n"
                    "The matching should cover the entire input string."
                ),
                "input_example": 's = "aa", p = "a*"',
                "output_example": "true",
                "test_cases": [
                    {"input": "aa\na*", "output": "true"},
                    {"input": "ab\n.*", "output": "true"},
                    {"input": "mississippi\nmis*is*p*.", "output": "false"},
                ],
            },
            {
                "title": "Minimum Window Substring",
                "difficulty": "Hard",
                "description": (
                    "Given two strings `s` and `t` of lengths m and n, return the minimum window substring "
                    "of `s` such that every character in `t` (including duplicates) is included in the window.\n\n"
                    "If there is no such substring, return the empty string \"\"."
                ),
                "input_example": 's = "ADOBECODEBANC", t = "ABC"',
                "output_example": '"BANC"',
                "test_cases": [
                    {"input": "ADOBECODEBANC\nABC", "output": "BANC"},
                    {"input": "a\na", "output": "a"},
                    {"input": "a\naa", "output": ""},
                ],
            },
        ],
    },
    {
        "name": "Sorting & Searching",
        "description": "Tasks on sorting algorithms and binary search",
        "problems": [
            {
                "title": "Binary Search",
                "difficulty": "Easy",
                "description": (
                    "Given an array of integers `nums` sorted in ascending order and an integer `target`, "
                    "write a function to search `target` in `nums`.\n\n"
                    "If `target` exists, return its index. Otherwise, return -1.\n"
                    "You must write an algorithm with O(log n) runtime complexity."
                ),
                "input_example": "nums = [-1, 0, 3, 5, 9, 12], target = 9",
                "output_example": "4",
                "test_cases": [
                    {"input": "-1 0 3 5 9 12\n9", "output": "4"},
                    {"input": "-1 0 3 5 9 12\n2", "output": "-1"},
                ],
            },
            {
                "title": "Merge Sorted Array",
                "difficulty": "Easy",
                "description": (
                    "You are given two integer arrays `nums1` and `nums2`, sorted in non-decreasing order, "
                    "and two integers `m` and `n`, representing the number of elements in `nums1` and `nums2` respectively.\n\n"
                    "Merge `nums2` into `nums1` as one sorted array."
                ),
                "input_example": "nums1 = [1, 2, 3, 0, 0, 0], m = 3, nums2 = [2, 5, 6], n = 3",
                "output_example": "[1, 2, 2, 3, 5, 6]",
                "test_cases": [
                    {"input": "1 2 3 0 0 0\n3\n2 5 6\n3", "output": "1 2 2 3 5 6"},
                    {"input": "1\n1\n\n0", "output": "1"},
                ],
            },
            {
                "title": "Search in Rotated Sorted Array",
                "difficulty": "Medium",
                "description": (
                    "There is an integer array `nums` sorted in ascending order with distinct values. "
                    "The array has been rotated at an unknown pivot.\n\n"
                    "Given the array `nums` after rotation and an integer `target`, "
                    "return the index of `target` if it is in `nums`, or -1 if not."
                ),
                "input_example": "nums = [4, 5, 6, 7, 0, 1, 2], target = 0",
                "output_example": "4",
                "test_cases": [
                    {"input": "4 5 6 7 0 1 2\n0", "output": "4"},
                    {"input": "4 5 6 7 0 1 2\n3", "output": "-1"},
                    {"input": "1\n0", "output": "-1"},
                ],
            },
            {
                "title": "Kth Largest Element in an Array",
                "difficulty": "Medium",
                "description": (
                    "Given an integer array `nums` and an integer `k`, return the kth largest element in the array.\n\n"
                    "Note that it is the kth largest element in the sorted order, not the kth distinct element.\n"
                    "You must solve it in O(n) average time complexity."
                ),
                "input_example": "nums = [3, 2, 1, 5, 6, 4], k = 2",
                "output_example": "5",
                "test_cases": [
                    {"input": "3 2 1 5 6 4\n2", "output": "5"},
                    {"input": "3 2 3 1 2 4 5 5 6\n4", "output": "4"},
                ],
            },
            {
                "title": "Count of Smaller Numbers After Self",
                "difficulty": "Hard",
                "description": (
                    "Given an integer array `nums`, return an integer array `counts` where `counts[i]` "
                    "is the number of smaller elements to the right of `nums[i]`."
                ),
                "input_example": "nums = [5, 2, 6, 1]",
                "output_example": "[2, 1, 1, 0]",
                "test_cases": [
                    {"input": "5 2 6 1", "output": "2 1 1 0"},
                    {"input": "-1", "output": "0"},
                ],
            },
            {
                "title": "Find Median from Data Stream",
                "difficulty": "Hard",
                "description": (
                    "The median is the middle value in an ordered integer list.\n\n"
                    "Implement the MedianFinder class:\n"
                    "- `addNum(int num)` — adds the integer num from the data stream to the data structure.\n"
                    "- `findMedian()` — returns the median of all elements so far.\n\n"
                    "Answers within 10^-5 of the actual answer will be accepted."
                ),
                "input_example": '["MedianFinder","addNum","addNum","findMedian","addNum","findMedian"]\n[[],[1],[2],[],[3],[]]',
                "output_example": "[null, null, null, 1.5, null, 2.0]",
                "test_cases": [
                    {"input": "1 2\nfindMedian", "output": "1.5"},
                    {"input": "1 2 3\nfindMedian", "output": "2.0"},
                ],
            },
        ],
    },
    {
        "name": "Dynamic Programming",
        "description": "Tasks on dynamic programming and memoization",
        "problems": [
            {
                "title": "Climbing Stairs",
                "difficulty": "Easy",
                "description": (
                    "You are climbing a staircase. It takes `n` steps to reach the top.\n\n"
                    "Each time you can either climb 1 or 2 steps. "
                    "In how many distinct ways can you climb to the top?"
                ),
                "input_example": "n = 3",
                "output_example": "3",
                "test_cases": [
                    {"input": "2", "output": "2"},
                    {"input": "3", "output": "3"},
                    {"input": "10", "output": "89", "hidden": False},
                ],
            },
            {
                "title": "House Robber",
                "difficulty": "Easy",
                "description": (
                    "You are a professional robber planning to rob houses along a street. "
                    "Each house has a certain amount of money stashed. "
                    "Adjacent houses have security systems connected — you cannot rob two adjacent houses.\n\n"
                    "Given an integer array `nums` representing the amount of money of each house, "
                    "return the maximum amount of money you can rob tonight."
                ),
                "input_example": "nums = [1, 2, 3, 1]",
                "output_example": "4",
                "test_cases": [
                    {"input": "1 2 3 1", "output": "4"},
                    {"input": "2 7 9 3 1", "output": "12"},
                ],
            },
            {
                "title": "Coin Change",
                "difficulty": "Medium",
                "description": (
                    "You are given an integer array `coins` representing coins of different denominations "
                    "and an integer `amount` representing a total amount of money.\n\n"
                    "Return the fewest number of coins needed to make up that amount. "
                    "If that amount cannot be made up by any combination of the coins, return -1."
                ),
                "input_example": "coins = [1, 5, 6, 9], amount = 11",
                "output_example": "2",
                "test_cases": [
                    {"input": "1 5 6 9\n11", "output": "2"},
                    {"input": "2\n3", "output": "-1"},
                    {"input": "1\n0", "output": "0"},
                ],
            },
            {
                "title": "Longest Increasing Subsequence",
                "difficulty": "Medium",
                "description": (
                    "Given an integer array `nums`, return the length of the longest strictly increasing subsequence."
                ),
                "input_example": "nums = [10, 9, 2, 5, 3, 7, 101, 18]",
                "output_example": "4",
                "test_cases": [
                    {"input": "10 9 2 5 3 7 101 18", "output": "4"},
                    {"input": "0 1 0 3 2 3", "output": "4"},
                    {"input": "7 7 7 7 7", "output": "1"},
                ],
            },
            {
                "title": "Edit Distance",
                "difficulty": "Hard",
                "description": (
                    "Given two strings `word1` and `word2`, return the minimum number of operations required "
                    "to convert `word1` to `word2`.\n\n"
                    "You have the following three operations permitted on a word:\n"
                    "- Insert a character\n"
                    "- Delete a character\n"
                    "- Replace a character"
                ),
                "input_example": 'word1 = "horse", word2 = "ros"',
                "output_example": "3",
                "test_cases": [
                    {"input": "horse\nros", "output": "3"},
                    {"input": "intention\nexecution", "output": "5"},
                ],
            },
            {
                "title": "Burst Balloons",
                "difficulty": "Hard",
                "description": (
                    "You are given n balloons, indexed from 0 to n - 1. Each balloon is painted with a number "
                    "on it represented by an array `nums`. You are asked to burst all the balloons.\n\n"
                    "If you burst the ith balloon, you will get `nums[i-1] * nums[i] * nums[i+1]` coins. "
                    "If i-1 or i+1 goes out of bounds, treat it as 1.\n\n"
                    "Return the maximum coins you can collect."
                ),
                "input_example": "nums = [3, 1, 5, 8]",
                "output_example": "167",
                "test_cases": [
                    {"input": "3 1 5 8", "output": "167"},
                    {"input": "1 5", "output": "10"},
                ],
            },
        ],
    },
    {
        "name": "Trees & Graphs",
        "description": "Tasks on tree traversal, graph algorithms, and BFS/DFS",
        "problems": [
            {
                "title": "Maximum Depth of Binary Tree",
                "difficulty": "Easy",
                "description": (
                    "Given the root of a binary tree, return its maximum depth.\n\n"
                    "The maximum depth is the number of nodes along the longest path "
                    "from the root node down to the farthest leaf node.\n\n"
                    "Input: space-separated level-order values, 'null' for missing nodes."
                ),
                "input_example": "root = [3, 9, 20, null, null, 15, 7]",
                "output_example": "3",
                "test_cases": [
                    {"input": "3 9 20 null null 15 7", "output": "3"},
                    {"input": "1 null 2", "output": "2"},
                ],
            },
            {
                "title": "Symmetric Tree",
                "difficulty": "Easy",
                "description": (
                    "Given the root of a binary tree, check whether it is a mirror of itself "
                    "(i.e., symmetric around its center).\n\n"
                    "Input: space-separated level-order values, 'null' for missing nodes."
                ),
                "input_example": "root = [1, 2, 2, 3, 4, 4, 3]",
                "output_example": "true",
                "test_cases": [
                    {"input": "1 2 2 3 4 4 3", "output": "true"},
                    {"input": "1 2 2 null 3 null 3", "output": "false"},
                ],
            },
            {
                "title": "Number of Islands",
                "difficulty": "Medium",
                "description": (
                    "Given an m x n 2D binary grid `grid` which represents a map of '1's (land) and '0's (water), "
                    "return the number of islands.\n\n"
                    "An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically."
                ),
                "input_example": (
                    'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]'
                ),
                "output_example": "1",
                "test_cases": [
                    {"input": "11110\n11010\n11000\n00000", "output": "1"},
                    {"input": "11000\n11000\n00100\n00011", "output": "3"},
                ],
            },
            {
                "title": "Binary Tree Level Order Traversal",
                "difficulty": "Medium",
                "description": (
                    "Given the root of a binary tree, return the level order traversal of its nodes' values "
                    "(i.e., from left to right, level by level).\n\n"
                    "Input: space-separated level-order values, 'null' for missing nodes."
                ),
                "input_example": "root = [3, 9, 20, null, null, 15, 7]",
                "output_example": "[[3],[9,20],[15,7]]",
                "test_cases": [
                    {"input": "3 9 20 null null 15 7", "output": "3\n9 20\n15 7"},
                    {"input": "1", "output": "1"},
                ],
            },
            {
                "title": "Serialize and Deserialize Binary Tree",
                "difficulty": "Hard",
                "description": (
                    "Serialization is the process of converting a data structure into a sequence of bits "
                    "so that it can be stored in a file or memory buffer.\n\n"
                    "Design an algorithm to serialize and deserialize a binary tree. "
                    "There is no restriction on how your serialization/deserialization algorithm should work."
                ),
                "input_example": "root = [1, 2, 3, null, null, 4, 5]",
                "output_example": "[1, 2, 3, null, null, 4, 5]",
                "test_cases": [
                    {"input": "1 2 3 null null 4 5", "output": "1 2 3 null null 4 5"},
                    {"input": "", "output": ""},
                ],
            },
            {
                "title": "Word Ladder",
                "difficulty": "Hard",
                "description": (
                    "A transformation sequence from word `beginWord` to word `endWord` using a dictionary "
                    "`wordList` is a sequence: beginWord -> s1 -> s2 -> ... -> endWord, where:\n"
                    "- Every adjacent pair of words differs by a single letter.\n"
                    "- Every si for 1 <= i <= k is in wordList.\n\n"
                    "Return the number of words in the shortest transformation sequence, or 0 if none exists."
                ),
                "input_example": 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]',
                "output_example": "5",
                "test_cases": [
                    {"input": "hit\ncog\nhot dot dog lot log cog", "output": "5"},
                    {"input": "hit\ncog\nhot dot dog lot log", "output": "0"},
                ],
            },
        ],
    },
    {
        "name": "Linked Lists",
        "description": "Tasks on linked list manipulation and traversal",
        "problems": [
            {
                "title": "Reverse Linked List",
                "difficulty": "Easy",
                "description": (
                    "Given the head of a singly linked list, reverse the list, and return the reversed list.\n\n"
                    "Input: space-separated values of the linked list nodes."
                ),
                "input_example": "head = [1, 2, 3, 4, 5]",
                "output_example": "[5, 4, 3, 2, 1]",
                "test_cases": [
                    {"input": "1 2 3 4 5", "output": "5 4 3 2 1"},
                    {"input": "1 2", "output": "2 1"},
                    {"input": "1", "output": "1", "hidden": False},
                ],
            },
            {
                "title": "Merge Two Sorted Lists",
                "difficulty": "Easy",
                "description": (
                    "You are given the heads of two sorted linked lists `list1` and `list2`.\n\n"
                    "Merge the two lists into one sorted list. The list should be made by splicing together "
                    "the nodes of the first two lists.\n\n"
                    "Return the head of the merged linked list."
                ),
                "input_example": "list1 = [1, 2, 4], list2 = [1, 3, 4]",
                "output_example": "[1, 1, 2, 3, 4, 4]",
                "test_cases": [
                    {"input": "1 2 4\n1 3 4", "output": "1 1 2 3 4 4"},
                    {"input": "\n", "output": ""},
                    {"input": "\n0", "output": "0"},
                ],
            },
            {
                "title": "Add Two Numbers",
                "difficulty": "Medium",
                "description": (
                    "You are given two non-empty linked lists representing two non-negative integers. "
                    "The digits are stored in reverse order, and each node contains a single digit. "
                    "Add the two numbers and return the sum as a linked list."
                ),
                "input_example": "l1 = [2, 4, 3], l2 = [5, 6, 4]",
                "output_example": "[7, 0, 8]",
                "test_cases": [
                    {"input": "2 4 3\n5 6 4", "output": "7 0 8"},
                    {"input": "0\n0", "output": "0"},
                    {"input": "9 9 9 9 9 9 9\n9 9 9 9", "output": "8 9 9 9 0 0 0 1"},
                ],
            },
            {
                "title": "Linked List Cycle II",
                "difficulty": "Medium",
                "description": (
                    "Given the head of a linked list, return the node where the cycle begins. "
                    "If there is no cycle, return null.\n\n"
                    "Input format: space-separated values followed by pos (index where tail connects, -1 if no cycle)."
                ),
                "input_example": "head = [3, 2, 0, -4], pos = 1",
                "output_example": "1",
                "test_cases": [
                    {"input": "3 2 0 -4\n1", "output": "1"},
                    {"input": "1 2\n0", "output": "0"},
                    {"input": "1\n-1", "output": "-1"},
                ],
            },
            {
                "title": "Reverse Nodes in k-Group",
                "difficulty": "Hard",
                "description": (
                    "Given the head of a linked list, reverse the nodes of the list k at a time, "
                    "and return the modified list.\n\n"
                    "k is a positive integer and is less than or equal to the length of the linked list. "
                    "If the number of nodes is not a multiple of k then left-out nodes, at the end, should remain as is."
                ),
                "input_example": "head = [1, 2, 3, 4, 5], k = 2",
                "output_example": "[2, 1, 4, 3, 5]",
                "test_cases": [
                    {"input": "1 2 3 4 5\n2", "output": "2 1 4 3 5"},
                    {"input": "1 2 3 4 5\n3", "output": "3 2 1 4 5"},
                ],
            },
            {
                "title": "Merge K Sorted Lists",
                "difficulty": "Hard",
                "description": (
                    "You are given an array of k linked lists, each linked list is sorted in ascending order.\n\n"
                    "Merge all the linked lists into one sorted linked list and return it.\n\n"
                    "Input: each line represents one linked list (space-separated values)."
                ),
                "input_example": "lists = [[1,4,5],[1,3,4],[2,6]]",
                "output_example": "[1, 1, 2, 3, 4, 4, 5, 6]",
                "test_cases": [
                    {"input": "1 4 5\n1 3 4\n2 6", "output": "1 1 2 3 4 4 5 6"},
                    {"input": "", "output": ""},
                ],
            },
        ],
    },
]


class Command(BaseCommand):
    help = "Seed the database with categories and problems"

    def add_arguments(self, parser):
        parser.add_argument("--clear", action="store_true", help="Delete existing problems and categories first")

    def handle(self, *args, **options):
        if options["clear"]:
            Problem.objects.all().delete()
            Category.objects.all().delete()
            self.stdout.write(self.style.WARNING("Cleared existing data."))

        admin = User.objects.filter(is_superuser=True).first()

        for cat_data in SEED_DATA:
            category, created = Category.objects.get_or_create(
                name=cat_data["name"],
                defaults={"description": cat_data["description"]},
            )
            action = "Created" if created else "Found"
            self.stdout.write(f"{action} category: {category.name}")

            for p in cat_data["problems"]:
                if Problem.objects.filter(title=p["title"], category=category).exists():
                    self.stdout.write(f"  Skipped (exists): {p['title']}")
                    continue

                problem = Problem.objects.create(
                    title=p["title"],
                    description=p["description"],
                    difficulty=p["difficulty"],
                    input_example=p.get("input_example", ""),
                    output_example=p.get("output_example", ""),
                    category=category,
                    created_by=admin,
                )

                for tc in p.get("test_cases", []):
                    TestCase.objects.create(
                        problem=problem,
                        input_data=tc["input"],
                        expected_output=tc["output"],
                        is_hidden=tc.get("hidden", True),
                    )

                self.stdout.write(f"  + [{p['difficulty']}] {p['title']}")

        self.stdout.write(self.style.SUCCESS("\nSeeding complete!"))
