import Book from "../models/bookModel.js";
import Member from "../models/memberModel.js";
import Loan from "../models/loanModel.js";
import Fine from "../models/fineModel.js";
import Payment from "../models/paymentModel.js";

/**
 * GET /api/reports/summary-dashboard
 * Admin-only
 */
export const getSummaryDashboard = async (req, res, next) => {
  try {
    const [
      totalBooks,
      totalMembers,
      activeLoans,
      overdueLoans,
      pendingFines,
      paymentAggregate,
    ] = await Promise.all([
      Book.countDocuments(),
      Member.countDocuments(),
      Loan.countDocuments({ status: "Active" }),
      Loan.countDocuments({ status: "Overdue" }),
      Fine.countDocuments({ status: "Pending" }),

      Payment.aggregate([
        { $match: { status: "Success" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const totalCollected = paymentAggregate[0]?.total || 0;

    const cards = [
      {
        key: "totalBooks",
        label: "Total Books",
        value: totalBooks,
        trend: { direction: "up", percentage: 0 },
      },
      {
        key: "totalMembers",
        label: "Total Members",
        value: totalMembers,
        trend: { direction: "up", percentage: 0 },
      },
      {
        key: "activeLoans",
        label: "Active Loans",
        value: activeLoans,
        trend: { direction: "up", percentage: 0 },
      },
      {
        key: "overdueLoans",
        label: "Overdue Loans",
        value: overdueLoans,
        trend: { direction: "down", percentage: 0 },
      },
      {
        key: "pendingFines",
        label: "Pending Fines",
        value: pendingFines,
        trend: { direction: "down", percentage: 0 },
      },
      {
        key: "totalCollected",
        label: "Total Collected (Fines)",
        value: totalCollected,
        trend: { direction: "up", percentage: 0 },
      },
    ];

    res.json({ cards });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reports/charts?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Admin-only
 */
export const getChartsData = async (req, res, next) => {
  try {
    let { from, to } = req.query;

    const toDate = to ? new Date(to) : new Date();
    toDate.setHours(23, 59, 59, 999);

    const fromDate = from
      ? new Date(from)
      : new Date(toDate.getTime() - 29 * 24 * 60 * 60 * 1000); // default 30 days

    // 1) Loans By Status
    const loansStatusAgg = await Loan.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const loansByStatus = {
      labels: loansStatusAgg.map((d) => d._id),
      values: loansStatusAgg.map((d) => d.count),
    };

    // 2) Fines By Status
    const finesStatusAgg = await Fine.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const finesByStatus = {
      labels: finesStatusAgg.map((d) => d._id),
      values: finesStatusAgg.map((d) => d.count),
    };

    // 3) Payments Over Time (daily total)
    const paymentsAgg = await Payment.aggregate([
      {
        $match: {
          status: "Success",
          createdAt: { $gte: fromDate, $lte: toDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Build continuous date array
    const labels = [];
    const values = [];

    let current = new Date(fromDate);
    while (current <= toDate) {
      const label = current.toISOString().slice(0, 10);
      labels.push(label);

      const found = paymentsAgg.find((p) => p._id === label);
      values.push(found ? found.totalAmount : 0);

      current.setDate(current.getDate() + 1);
    }

    const paymentsOverTime = {
      labels,
      values,
    };

    // Final response
    res.json({
      loansByStatus,
      finesByStatus,
      paymentsOverTime,
    });
  } catch (error) {
    next(error);
  }
};
