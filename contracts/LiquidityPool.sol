// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "https://cdn.jsdelivr.net/npm/@openzeppelin/contracts@4.7.3/access/Ownable.sol";
import "https://cdn.jsdelivr.net/npm/@openzeppelin/contracts@4.7.3/token/ERC20/utils/SafeERC20.sol";


interface IERC20Decimals is IERC20 {
    function decimals() external view returns (uint8);
}

contract LiquidityPool is Ownable {
    using SafeERC20 for IERC20Decimals;

    IERC20Decimals public immutable token;   // e.g., MXNe or BRZ
    uint256 public totalShares;
    mapping(address => uint256) public shares;
    mapping(address => uint256) public balances;

    event Deposit(address indexed user, uint256 amount, uint256 sharesMinted);
    event Withdraw(address indexed user, uint256 amount, uint256 sharesBurned);

    constructor(address _token) {
        token = IERC20Decimals(_token);
    }

    /// @notice Deposit tokens and receive shares
    function deposit(uint256 amount) external {
        require(amount > 0, "Zero amount");
        uint256 _totalAssets = token.balanceOf(address(this));
        uint256 _shares = totalShares == 0
            ? amount
            : (amount * totalShares) / _totalAssets;
        require(_shares > 0, "Zero shares");

        totalShares += _shares;
        shares[msg.sender] += _shares;
        balances[msg.sender] += amount;

        token.safeTransferFrom(msg.sender, address(this), amount);
        emit Deposit(msg.sender, amount, _shares);
    }

    /// @notice Withdraw tokens by burning shares
    function withdraw(uint256 shareAmount) external {
        require(shareAmount > 0 && shares[msg.sender] >= shareAmount, "Invalid shares");
        uint256 _totalAssets = token.balanceOf(address(this));
        uint256 amount = (shareAmount * _totalAssets) / totalShares;

        totalShares -= shareAmount;
        shares[msg.sender] -= shareAmount;
        balances[msg.sender] -= amount;

        token.safeTransfer(msg.sender, amount);
        emit Withdraw(msg.sender, amount, shareAmount);
    }

    /// @notice Get asset balance corresponding to shares
    function balanceOf(address user) external view returns (uint256) {
        if (totalShares == 0) return 0;
        return (shares[user] * token.balanceOf(address(this))) / totalShares;
    }
}