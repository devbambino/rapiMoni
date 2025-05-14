// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "https://cdn.jsdelivr.net/npm/@openzeppelin/contracts@4.7.3/access/Ownable.sol";
import "https://cdn.jsdelivr.net/npm/@openzeppelin/contracts@4.7.3/token/ERC20/utils/SafeERC20.sol";

interface IERC20Decimals is IERC20 {
    function decimals() external view returns (uint8);
}

interface ILiquidityPool {
    function deposit(uint256) external;
    function withdraw(uint256) external;
}

interface IFeePool {
    function collectFee(uint256) external;
}

contract MicroloanManager is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20Decimals;

    IERC20Decimals public immutable usdc;
    IERC20Decimals public immutable asset;  // MXNe or BRZ
    ILiquidityPool public immutable lenderPool;
    IFeePool public immutable feePool;

    struct Loan {
        uint256 collateral;    // USDC locked
        uint256 principal;     // asset lent
        uint256 startTime;
        uint256 term;          // in seconds
        uint256 paid;          // amount repaid
        bool    active;
    }

    mapping(address => Loan) public loans;
    uint256 public feeRatePerSecond; // merchant paid fee rate

    event LoanOpened(address indexed user, uint256 collateral, uint256 principal, uint256 term);
    event Repaid(address indexed user, uint256 amount);
    event Liquidated(address indexed user);

    constructor(
        address _usdc,
        address _asset,
        address _lenderPool,
        address _feePool,
        uint256 _feeRatePerSecond
    ) {
        usdc = IERC20Decimals(_usdc);
        asset = IERC20Decimals(_asset);
        lenderPool = ILiquidityPool(_lenderPool);
        feePool = IFeePool(_feePool);
        feeRatePerSecond = _feeRatePerSecond;
    }

    /// @notice Open a single loan per user
    function openLoan(uint256 collateralAmount, uint256 termInSeconds) external nonReentrant {
        Loan storage loan = loans[msg.sender];
        require(!loan.active, "Existing loan");
        require(collateralAmount > 0 && termInSeconds > 0, "Invalid params");

        uint256 collateralNeeded = collateralAmount;
        usdc.safeTransferFrom(msg.sender, address(this), collateralNeeded);
        // compute principal: asset amount based on price feed, omitted here
        uint256 principal = collateralAmount; // assume 1:1 for simplicity

        loan.collateral = collateralNeeded;
        loan.principal = principal;
        loan.startTime = block.timestamp;
        loan.term = termInSeconds;
        loan.active = true;
        loan.paid = 0;

        // deposit to lender pool
        asset.safeApprove(address(lenderPool), principal);
        lenderPool.deposit(principal);

        // disburse principal
        asset.safeTransfer(msg.sender, principal);
        emit LoanOpened(msg.sender, collateralNeeded, principal, termInSeconds);
    }

    /// @notice Repay a portion or full loan
    function repay(uint256 paymentAmount) external nonReentrant {
        Loan storage loan = loans[msg.sender];
        require(loan.active, "No active loan");

        // accrue fee to fee pool
        uint256 elapsed = block.timestamp - loan.startTime;
        uint256 fee = elapsed * feeRatePerSecond;
        feePool.collectFee(fee);

        // apply payment
        usdc.safeTransferFrom(msg.sender, address(this), paymentAmount);
        loan.paid += paymentAmount;

        // if fully repaid
        if (loan.paid >= loan.collateral) {
            // return collateral
            usdc.safeTransfer(msg.sender, loan.collateral);
            loan.active = false;
        }
        emit Repaid(msg.sender, paymentAmount);
    }

    /// @notice Liquidate overdue loans
    function liquidate(address user) external onlyOwner nonReentrant {
        Loan storage loan = loans[user];
        require(loan.active, "No active loan");
        require(block.timestamp > loan.startTime + loan.term, "Not overdue");

        // seize collateral
        uint256 seized = loan.collateral;
        loan.active = false;

        // optionally swap collateral to asset for lender pool
        // omitted for brevity

        emit Liquidated(user);
    }

    /// @notice Adjust the merchant fee rate
    function setFeeRate(uint256 newRate) external onlyOwner {
        feeRatePerSecond = newRate;
    }
}