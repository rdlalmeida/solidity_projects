// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
import "hardhat/console.sol";

contract CarFactory {
    uint256 private nextCarId;
    address public factoryOwner;

    mapping(uint256 carId => address) private carOwner; 
    mapping(uint256 carId => string) public carColor;
    mapping(uint256 carId => string) public licencePlate;
    mapping(uint256 carId => bool) public runningCar;
    mapping(uint256 carId => string) private insurancePolicy;

    event CarCreated(uint256 _carId);
    event CarStarted(uint256 _carId);
    event CarStopped(uint256 _carId);
    event CarDestroyed(uint256 _carId);

    constructor() {
        nextCarId = 1;
        factoryOwner = msg.sender;
    }

    /**
     * Function to create a new car asset
     * @param newCarColor The color of the car to build.
     * @param newLicencePlate The licence plate to add to the car asset
     * @param newInsurancePolicy The insurance policy associated to the car built.
     * @return uint256 The carId of the new car.
     */
    function createCar(address newOwner, string memory newCarColor, string memory newLicencePlate, string memory newInsurancePolicy) public returns(uint256) {
        require(msg.sender == factoryOwner, "You don't own this car factory!");
        // Save the current carId and increment the counter at the end for the next car
        uint256 currentCarId = nextCarId++;

        // Fill out the mappings
        carOwner[currentCarId] = newOwner;
        carColor[currentCarId] = newCarColor;
        licencePlate[currentCarId] = newLicencePlate;
        runningCar[currentCarId] = false;
        insurancePolicy[currentCarId] = newInsurancePolicy;

        emit CarCreated(currentCarId);
        return currentCarId;
    }

    function startCar(uint256 carId) public {
        require(carOwner[carId] == msg.sender, "You don't own this car!");

        if (!runningCar[carId]) {
            runningCar[carId] = true;
        }

        emit CarStarted(carId);
    }

    function stopCar(uint256 carId) public {
        require(carOwner[carId] == msg.sender, "You don't own this car!");

        if (runningCar[carId]) {
            runningCar[carId] = false;
        }

        emit CarStopped(carId);
    }

    function isCarRunning(uint256 carId) public view returns(bool) {
        return runningCar[carId];
    }

    function destroyCar(uint256 carId) public {
        require(carOwner[carId] == msg.sender, "You don't own this car!");

        delete insurancePolicy[carId];
        delete runningCar[carId];
        delete licencePlate[carId];
        delete carColor[carId];
        delete carOwner[carId];

        emit CarDestroyed(carId);
    }
}
