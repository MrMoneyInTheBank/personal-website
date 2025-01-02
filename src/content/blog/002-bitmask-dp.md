---
title: Bit manipulation + dynamic programming?
description: What is bitmask DP?
pubDatetime: 2025-01-02T12:17:39.909Z
featured: true
draft: false
tags:
    - dynamic programming
    - algorithms
    - competitive programming
---
Bits form the foundation of everything we do as programmers, but their study often doesn't go beyond learning the basic logic gates. At first, it may seem that getting comfortable with bit manipulation has no application but a binary representation can be a highly memory efficient way of expressing state in a dynamic programming context.

## What is a bitmask?
Consider the following scenario: there are 10 switches on a wall, all of them are initially turned off. What is the most efficient way of representing which switches are turned on at any given point? The simplest approach is adding all the switches which are turned on into a hashset but this has a linear space complexity. The optimal solution is to use a bitmask.

A bitmask is a binary representation of a system wherein each bit in the mask represents a boolean state — the status of the light in our scenario. For example, `b0000000000 = 0` can represent the initial state where all the switches are off. `b0001010001 = 81` can represent the state where the first, fifth, and seventh switch are turned on. Notice how we have condensed the representation of a state from a hashset to a single number. Moreover, since there are $2^{10}$ possible configurations for the switches (each switch can be on or off), there are $2^{10}$ different masks.

### State transitions using bitmasks
A bitmask wouldn't be helpful without a simple way to handle state transitions. Since each individual bit represents something that can exist in one of two states, the transition between states entails toggling them between states.

```cpp
int mask = 0; //...00000 in binary
if (mask & (1 << i)) {...} // Checking if the i'th bit is set
mask &= ~(1 << i); // Clearing the i'th bit
mask ^= (1 << i); // Toggle the i'th bit
```

## When are bitmasks used in DP?

Imagine you come across a problem which you correctly identify can be solved using DP. You write a recursive function to solve it and to go the extra mile, you memoize it. The constraints of the problem are rather small so you think you've arrived at the optimal solution. Your code passes some of the testcases, but not all. You're at a loss. Everything is logically correct. Then you notice that you're tracking state via a array (global or local) which you must convert into a tuple before checking your cache. 

If the constraints are relatively small, and the system consists of components in a boolean state, bitmasks can be used to represent the state, which reduces the complexity.

## Travelling salesman problem

To see an application of bitmask DP, lets consider a classic problem. There are `n` cities. You are given a 2D integer array `cost` of size `n x n`, where `cost[i][j]` is the cost is takes a saleman to travel from city `i` to city `j`. The salesman starts at city `0`. He must visit every other city exactly once and then return the city `0`. What's the minimum cost that this tour can be accomplished in?

### Brute force solution
The brute force solution would involve generating every acyclic path from 0, adjusting the cost while doing so, and then returning the minimum cost.

```cpp
#include <vector>
#include <unordered_set>
#include <functional>
#include <algorithm>

int travelling_salesman(const std::vector<std::vector<int>> &cost){
    int minimum_cost = INT_MIN;
    std::unordered_set<int> seen = {0};

    std::function<int(int, int)> dfs = [&](int current_city, int current_cost) {
        if (seen.size() == cost.size()) {
            minimum_cost = std::min(minimum_cost, 
                                    current_cost + cost[current_city][0]);
            return;
        }

        for (int next_city = 0; next_city < cost.size(); next_city++) {
            if (seen.contains(next_city)) continue;
            seen.insert(next_city);
            dfs(next_city, current_city + cost[current_city][next_city]);
            seen.erase(next_city);
        }
    };
    dfs(0, 0);
    return minimum_cost;
}
```
The code above recursively explores neighbours of the current city if they have not already been explored earlier in the journey. While correct, it is terribly inefficient. It has a linear space complexity and a time complexity of $\Theta(n!)$.

### Slight optimization with memoization

One of the reasons the previous code is inefficient is because of expensive recomputations. Notice that the state in this context is the current position, and the list of cities already visited. This allows us to have a unique identifier for every subproblem. However, before we can memoize our solution, we must first have a function that can be memoized. We need to change our helper function to a non-void return type. 

Consider what the state in this DP problem is:
- current city (int): City currently being explored
- seen (set\<int\>): Cities previously explored

We know that every city has been explored when `seen.size()` is `n`. At this point, we need to return back to the start. Otherwise, keep keep exploring unexplored cities and choose the cheapest path.

```cpp
#include <vector>
#include <unordered_set>
#include <functional>
#include <algorithm>

int travelling_salesman(const std::vector<std::vector<int>> &cost) {
    std::function<int(int, std::unordered_set<int>)> dp = [&](
        int current_city, std::unordered_set<int> seen
    ) {
        if (seen.size() == cost.size()) return cost[current_city][0];

        int ans = INT_MAX;
        for (int next_city = 0; next_city < cost.size(); next_city++) {
            if (!seen.contains(next_city)) {
                std::unordered_set<int> new_seen = seen;
                new_seen.insert(next_city);
                ans = std::min(ans, cost[current_city][next_city] + dp(next_city,
                                                                       new_seen));
            } 
        }
        return ans;
    };
    return dp(0, {0});
}
```

We have successfully adapted our helper function to return an integer but we still have the task of memoizing it. In other languages like Python or JavaScript/TypeScript, this would be a very simple task (literally just add a python decorator). In lower-level languages like C++ however, its not that simple. An `unordered_set` is not directly hashable so we'll have to get around that with a hacky solution. Even in languages wherein it's simple to memoize, it is still not as efficient as using  a bitmask. Let's explore that solution now.

### Using bitmasks
Since there are `n` cities, we can use a mask of `n` digits. Each digit representing a city and each digits value representing if its been visited already or not.

```cpp
#include <algorithm>
#include <functional>
#include <vector>

int travelling_salesman(const std::vector<std::vector<int>> &cost) {
  std::vector<std::vector<int>> memo(cost.size(),
                                     std::vector<int>(1 << cost.size(), -1));

  std::function<int(int, int)> dp = [&](int curr, int mask) {
    if (mask == (1 << cost.size()) - 1) // all 1's indicates complete journey
      return cost[curr][0];

    if (memo[curr][mask] != -1)
      return memo[curr][mask];

    int ans = INT_MAX;
    for (int i = 0; i < cost.size(); i++) {
      if ((mask & (1 << i)) == 0) { // if i'th city has not been visited
        ans = std::min(ans, cost[curr][i] + dp(i, mask | 1 << i)); // set i'th bit
      }
    }

    memo[curr][mask] = ans;
    return ans;
  };
  return dp(0, 1);
}
```
Using bitmasks allowed us to retain the same amount of information with a lower memory footprint and as an added bonus, it was very easy to memoize this solution.

## Final thoughts
Bitmasking is always the final level of optimization a problem requires. For instance, a DFS solution generally gets cached and becomes a DP solution and if further optimization is still needed, bitmasking can be a helpful tool.
