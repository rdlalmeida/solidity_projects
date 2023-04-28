pragma solidity ^0.8.19;

contract Fibonacci {
    uint[] fibseries;

    // n = how many in the series to return
    function generateFib(uint n) public {
        // set 1st and 2nd entries
        fibseries.push(1);
        fibseries.push(1);

        // Generate subsequent entries
        for (uint i = 1; i < n; i++) {
            fibseries.push(fibseries[i - 1] + fibseries[i - 2]);
        }
    }

    // function getSeries() view public returns (uint[]) {
    //     return fibseries;
    // }
}