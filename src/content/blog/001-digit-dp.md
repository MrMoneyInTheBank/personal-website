---
title: Should you care to learn digit dynamic programming?
description: Dummy description
pubDatetime: 2025-01-01T09:30:00.000Z
tags:
    - dynamic programming
    - algorithms
    - competitive programming
---
To answer the question briefly, no. I don't personally believe you need to learn digit DP. I *highly* doubt it that you will be asked a digit DP question in an interview. If you are, abandon the interview and try again.

## What is dynamic programming?
If you aren't familiar with the basics of dynamic programming, this article might be an uncomfortable read but I'll try to briefly provide a high-level idea. In a nutshell, dynamic programming (DP) is a technique that combines the correctness of complete search and the efficiency of greedy algorithms. If you ever find yourself writing an algorithm that does a lot of repeated work, dynamic programming can help reduce the time complexity of the algorithm while still ensuring that the output is the same.

For example, consider the classic problem of implementing a function to compute the $n$'th fibonacci number. For those who don't know, the fibonacci sequence is defined to be $f_0 = 0, f_1 = 1, f_n = f_{n-1} + f_{n-2} \text{ for } n > 1$. Given that the sequence itself is defined via a recurrence relation, a recursive approach is the most obvious solution and it looks like this.

```cpp
int get_nth_fib(int n) {
    if (n <= 1) return n;
    else return get_nth_fib(n-1) + get_nth_fib(n-2);
}
```

While this implementation is correct, it has an exponential time complexity and a linear space complexity. We can optimize this function by noticing that at any given stage, we are only interested in the previous two fibonacci numbers. This will allow us to compute the next fibonacci number. We can generate the $n$'th fibonacci number iteratively using the following optimization.

```cpp
int get_nth_fib_dp(int n) {
    if (n <= 1) return n;

    int last = 1, second_last = 0;
    for (int i = 2; i <= n; i++) {
        int current = last + second_last;
        second_last = last;
        last = current;
    }
    return last;
}
```
We still perform a complete search, but greedily wrote our algorithm. This function has a linear time complexity and constant space complexity.

This is just one example of a DP algorithm. Within the family of DP algorithms, you'll hear terms like top-down DP, bottom-up DP, divide-and-conquer, memoization. They're all just implementation details. What I find more interesting is learning different types of DP algorithms. One such type, is digit DP.

## What is Digit DP?
Consider the following problem: given an integer $\text{low}$ and an integer $\text{high}$ determine the number of integers within the inclusive range $[\text{low}, \text{high}]$ such that the sum of the digits of that integer is 5. When this range is small, the simplest solution is to loop through all the integers in the given range, calculate the digit sum and accordingly increase our count.

```cpp
#include <functional>

int count_magic_numbers(int low, int high) {
    int count = 0;
    std::function<int(int)> get_digit_sum = [](int number) {
        int digit_sum = 0;

        while (number) {
            digit_sum += number % 10;
            number /= 10;
        }
        return digit_sum;
    };

    for (int i = low; i <= high; i++) {
        int digit_sum = get_digit_sum(i);
        if (digit_sum == 5) count++;
    }

    return count;
}
```

The code above is logically correct and will return the correct answer but what happens when $\text{low}$ is a very low number — possibly 0 — and $\text{high}$ is a very large number — on the order of $\mathcal{O}(10^{20})$. Even in a fast language like C++, the computation will take ages since the time complexity of the code above is quasi-linear. This is where digit DP comes in.

Digit DP is family of dynamic programming techniques designed to efficiently count or construct integers within a given range that satisfy a certain property. Instead of iterating through every integer in the range, digit DP constructs numbers digit by digit, starting from the most significant digit and working toward the least significant, while respecting the bounds of the range.

The largest number in the range will have $\log_{10}(\text{high})$ digits, and for each digit position, we consider up to 10 choices (0-9). The time complexity of digit DP is typically $\Theta(\text{number of digits } \times \text{choices per digit } \times \text{ state transitions})$. This leads to a far more time efficient algorithm than a brute-force approach. If you're unsure of what a state is, it is nothing but a specific set of parameters that uniquely identify a subproblem. In the earlier fibonacci example, $n$ was the state and the state transitions involved going from $n \to n-1, n-2$.

Let's attempt to optimize our solution using digit DP. First note that the number of magic integers in the range $[\text{low}, \text{high}]$ is the same as the amount of magic integers in the range $[0, \text{high}]$ minus the amount of magic integers in the range $[0, \text{low}-1]$. As we build a potential integer, these are the factors we need to keep track of:
- pos (int): Current digit position being considered
- digit_sum (int): Running sum of digits processed so far
- under (boolean): Boolean flag indicating if number is within range
- started (boolean): Boolean flag indicating if number has non-zero digits 

At each position, we try adding a digit from the 0 to 9. If the under flag is true, we can explore this whole range since some digit place earlier in the integer is less than the corresponding digit in the upperbound. Otherwise, we check if the current digit is not greater than the corresponding digit in the upperbound, abandoning the construction if so. After adding the digit, we adjust the digit sum, and our boolean flags and continue the construction from the next position. Once we match the number of digits in the upperbound, we return 1 if the digit sum matches the target sum indicating a valid construction and 0 otherwise.

```cpp
#include <string>

int get_magic_numbers_until(
    int pos,
    int digit_sum,
    bool under,
    bool started,
    const std::string &upperbound
) {
    if (pos == upperbound.length()) {
        return started && digit_sum == 5 ? 1 : 0;
    }

    int count = 0;
    int bound_digit = upperbound[pos] - '0';

    for (int digit = 0; digit <= 9; digit++) {

        if (!under and digit > bound_digit) break;

        int new_sum = digit_sum + digit;
        bool is_under = under || digit < bound_digit;
        bool is_started = started || digit != 0;

        count += get_magic_numbers_until(pos + 1,
                                      new_sum,
                                      is_under,
                                      is_started,
                                      upperbound);
    }
    return count;
}
```

This allows us to refactor our code to be

```cpp
#include <string>

int get_magic_numbers_until(
    int pos,
    int digit_sum,
    bool under,
    bool started,
    const std::string &upperbound
) {/*...*/}

int get_magic_numbers(int low, int high) {
    int until_high = get_magic_numbers_until(0, 0, false, false, std::to_string(high));
    int uptil_low = get_magic_numbers_until(0, 0, false, false, std::to_string(--low));

    return until_high - uptil_low;
}
```

However, this implementation is not quite finished. Consider the incomplete integers 23... and 14... . We are at the same position, with the same digit sum, and assume the under and started flags are true. In terms of state, they are the same. The implementation above however will recompute the count even though it is not needed. This is where <a target="_blank" href="https://cp-algorithms.com/dynamic_programming/intro-to-dp.html">memoization</a> will help us. Currently, the time complexity is exponential. Memoization allows us reduce the time complexity to be $\Theta(D^2)$ where $D=\log_{10}(\text{high})$ as there are $D$ positions and a maximum of $D$ digits to consider for each position. Here's the full code.

```cpp
#include <string>
#include <vector>

using std::string, std::vector;

vector<vector<vector<vector<int>>>> create_memo_table(int max_digits, int max_digit_sum) {
    vector<vector<vector<vector<int>>>> memo(
        max_digits, vector<vector<vector<int>>>(
            max_digit_sum + 1, vector<vector<int>>(
                2, vector<int>(2, -1)
            )
        )
    );
    return memo;
}

void reset(vector<vector<vector<vector<int>>>> &memo) {
    for (int i = 0; i < memo.size(); i++) {
        for (int j = 0; j < memo[i].size(); j++) {
            for (int k = 0; k < memo[i][j].size(); k++) {
                for (int l = 0; l < memo[i][j][k].size(); l++) {
                    memo[i][j][k][l] = -1;
                }
            }
        }
    }
}

int get_magic_numbers_until(
    int pos,
    int digit_sum,
    bool under,
    bool started,
    const string &upperbound,
    vector<vector<vector<vector<int>>>> &memo
) {
    if (pos == upperbound.length()) {
        return started && digit_sum == 5 ? 1 : 0;
    }
    
    if (memo[pos][digit_sum][under][started] != -1) {
        return memo[pos][digit_sum][under][started];
    }

    int count = 0;
    int bound_digit = upperbound[pos] - '0';

    for (int digit = 0; digit <= 9; digit++) {

        if (!under and digit > bound_digit) break;

        int new_sum = digit_sum + digit;
        bool is_under = under || digit < bound_digit;
        bool is_started = started || digit != 0;

        count += get_magic_numbers_until(pos + 1,
                                      new_sum,
                                      is_under,
                                      is_started,
                                      upperbound,
                                      memo);
    }

    memo[pos][digit_sum][under][started] = count; 
    return count;
}

int get_magic_numbers(int low, int high) {
    int max_digits = to_string(high).length();
    int max_digit_sum = 9 * max_digits;
    
    vector<vector<vector<vector<int>>>> memo = create_memo_table(max_digits, max_digit_sum);

    int until_high = get_magic_numbers_until(0, 0, false, false, std::to_string(high), memo);
    reset(memo);
    int uptil_low = get_magic_numbers_until(0, 0, false, false, std::to_string(--low), memo);

    return until_high - uptil_low;
}
```
## Final thoughts
That's the essence of digit DP. Constructing a number sequentially while keeping within the range. Although applications of this technique are generally limited to competitive programming scenarios, man does it feel good when you're able to solve that question.


