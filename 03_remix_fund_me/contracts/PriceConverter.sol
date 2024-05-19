// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
  function getDecimals() internal view returns(uint8) {
      AggregatorV3Interface aggr = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);

      return aggr.decimals();
  }

  function getPrice() internal view returns (uint256) {
      // ABI
      // Address (Ethereum data feed for Sepolia Network from docs.chain.link/docs/ethereum-addresses) ETH/USD:
      // 0x694AA1769357215DE4FAC081bf1f309aDC325306
      AggregatorV3Interface priceFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);

      /*
          The lastestRoundData function returns a 5 element tuple and so the variable that captures this needs to reflect that. But since I only need the price
          element, the rest can remain blank. But they need to be specified nonetheless.
      */
      (,int256 price,,,) = priceFeed.latestRoundData();

      // Price is expresses as ETH/USD
      // msg.value is expresses in wei units, i.e., 1e-18 ETH
      // Price on the other hand is expressed in ETH with a fixed number of decimals, which using the decimals functions, turns out to be 8
      // To ensure both price and msg.value are in the same scale, the price returned needs to reflect those 18 decimals from msg.value.
      // Since 18-8 = 10:

      return uint256(price * 1e10);
  }

  function getConversionRate(uint256 ethAmount) internal view returns(uint256) {
      uint256 ethPrice = getPrice();

      // I need to divide the result by 1e18 because I'm multiplying two values with 18 decimals each, which results in one with 36 decimals.
      return ((ethPrice * ethAmount) / 1e18);
  }
}
