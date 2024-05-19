// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
// import {FundMe} from "./FundMe.sol";

library PriceConverter {
    // We could make this public, but then we'd have to deploy it
    function getPrice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        // Sepolia ETH / USD Address

        (, int256 answer, , , ) = priceFeed.latestRoundData();
        // ETH/USD rate in 18 digit

        return uint256(answer * 1e10); // 1e10 = 10000000000
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18; // 1e18 = 1000000000000000000

        return ethAmountInUsd;
    }
}
