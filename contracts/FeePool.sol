// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "https://cdn.jsdelivr.net/npm/@openzeppelin/contracts@4.7.3/access/Ownable.sol";
import "https://cdn.jsdelivr.net/npm/@openzeppelin/contracts@4.7.3/token/ERC20/utils/SafeERC20.sol";


interface ILiquidityPool {
    function totalShares() external view returns (uint256);
    function shares(address user) external view returns (uint256);
}

contract FeePool is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;       // fee token, e.g., USDC
    ILiquidityPool public immutable pool;
    address public treasury;

    uint256 public totalFees;
    mapping(address => uint256) public claimed;

    event FeeCollected(uint256 amount);
    event FeeClaimed(address indexed user, uint256 amount);

    constructor(address _token, address _pool, address _treasury) {
        token = IERC20(_token);
        pool = ILiquidityPool(_pool);
        treasury = _treasury;
    }

    /// @notice Collect merchant fee
    function collectFee(uint256 amount) external onlyOwner {
        require(amount > 0, "Zero fee");
        token.safeTransferFrom(msg.sender, address(this), amount);
        totalFees += amount;
        emit FeeCollected(amount);
    }

    /// @notice Claim pro-rata share of fees
    function claim() external {
        uint256 userShares = pool.shares(msg.sender);
        uint256 totalShares = pool.totalShares();
        require(userShares > 0 && totalShares > 0, "No shares");

        uint256 entitled = (totalFees * userShares) / totalShares;
        uint256 claimable = entitled - claimed[msg.sender];
        require(claimable > 0, "Nothing to claim");

        // compute treasury cut
        uint256 treasuryCut = (claimable * 10) / 100;
        uint256 userAmount = claimable - treasuryCut;
        claimed[msg.sender] += claimable;
        totalFees -= claimable;

        token.safeTransfer(msg.sender, userAmount);
        token.safeTransfer(treasury, treasuryCut);
        emit FeeClaimed(msg.sender, userAmount);
    }

    /// @notice Treasury withdrawal of its accumulated share
    function withdrawTreasury(uint256 amount) external {
        require(msg.sender == treasury, "Forbidden");
        token.safeTransfer(treasury, amount);
    }
}