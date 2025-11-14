// src/controllers/loan.controller.js
import Loan from "../models/loanModel.js"
import Book from "../models/bookModel.js";
import Member from "../models/memberModel.js";
import Fine from "../models/fineModel.js";
import { LOAN_PERIOD_DAYS, fineAmount } from "../utils/circulationUtils.js";

//helper
const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
};

/**
 * POST /api/loans
 */

export const issueLoan = async (req, res, next) => {
    try {
    const { bookId, memberId } = req.body;
    const staffId = req.user?.id; // from auth middleware (staff/admin)

    // 1) validate inputs
    if (!bookId || !memberId) {
      return res.status(400).json({ message: "bookId and memberId are required" });
    }

    // 2) fetch entities
    const [book, member] = await Promise.all([
      Book.findById(bookId),
      Member.findById(memberId).select("+active"), // ensure we can read active
    ]);

    if (!book) return res.status(404).json({ message: "Book not found" });
    if (!member) return res.status(404).json({ message: "Member not found" });

    // 3) business rules
    if (!book.available) {
      return res.status(409).json({ message: "Book is not available" });
    }
    if (member.active === false) {
      return res.status(403).json({ message: "Member is not active" });
    }

    // 4) compute due date
    const borrow_date = new Date();
    const due_date = addDays(borrow_date, LOAN_PERIOD_DAYS);

    // 5) flip book availability first
    book.available = false;
    await book.save();

    // 6) create loan
    const loan = await Loan.create({
      book: book._id,
      member: member._id,
      staff: staffId,
      borrow_date,
      due_date,
      status: "Active",
    });

    return res.status(201).json({
      message: "Loan issued",
      data: {
        loan,
        book: { _id: book._id, available: book.available },
      },
    });
  } catch (err) {
    next(err);
    }
}


/**
 * PUT /api/loans/:id/return
 * auth: staff/admin
 */
export const returnLoan = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1) find loan + book
    const loan = await Loan.findById(id).populate("book");
    if (!loan) return res.status(404).json({ message: "Loan not found" });

    if (loan.status === "Returned") {
      return res.status(409).json({ message: "Loan already returned" });
    }

    // 2) mark return time
    const now = new Date();
    loan.return_date = now;

    // 3) compute and upsert fine if overdue
    const amount = fineAmount(loan.due_date, now);
    if (amount > 0) {
      // upsert a Pending fine unless already Paid/Waived
      let fine = await Fine.findOne({ loan: loan._id });

      if (!fine) {
        fine = await Fine.create({
          loan: loan._id,
          amount,
          status: "Pending",
          reason: "Overdue return",
        });
      } else if (fine.status === "Pending") {
        fine.amount = amount; // update to latest computed amount
        await fine.save();
      }
      loan.fine_snapshot = amount;
    }

    // 4) set status to Returned (Overdue status is only for active, unreturned loans)
    loan.status = "Returned";
    await loan.save();

    // 5) flip book availability
    if (loan.book && loan.book.available === false) {
      loan.book.available = true;
      await loan.book.save();
    }

    return res.json({
      message: "Loan returned",
      data: {
        loan: {
          _id: loan._id,
          status: loan.status,
          return_date: loan.return_date,
          fine_snapshot: loan.fine_snapshot,
        },
        book: { _id: loan.book?._id, available: loan.book?.available },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/loans/:id/renew
 * auth: staff/admin or member (own loan)
 */
export const renewLoan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const loan = await Loan.findById(id).populate("book member");
    if (!loan) return res.status(404).json({ message: "Loan not found" });

    // Ownership check for member
    if (user.role === "member" && String(loan.member._id) !== String(user.id)) {
      return res.status(403).json({ message: "Forbidden: not your loan" });
    }

    if (loan.status === "Returned") {
      return res.status(409).json({ message: "Cannot renew returned loan" });
    }

    if (isOverdue(loan)) {
      return res.status(409).json({ message: "Cannot renew overdue loan" });
    }

    if (!loan.book.available && loan.status !== "Active") {
      return res.status(409).json({ message: "Book currently unavailable" });
    }

    // Extend due date
    loan.due_date = addDays(loan.due_date, LOAN_PERIOD_DAYS);
    await loan.save();

    return res.json({
      message: "Loan renewed successfully",
      data: { id: loan._id, new_due_date: loan.due_date },
    });
  } catch (err) {
    next(err);
  }
};

const amount = fineAmount(Loan.due_date, now);
if (amount > 0) {
  let fine = await Fine.findOne({loan: Loan_id});
  if(!fine) {
    fine = await Fine.create({
      loan: Loan._id,
      member: Loan.member,
      amount,
      status: "Pending",
      reason: "Overdue return",
    });
  } else if (fine.status === "Pending") {
    fine.amount = amount;
    fine.member = Loan.member;
    await fine.save();
  }
  Loan.fine_snapshot = amount;
}