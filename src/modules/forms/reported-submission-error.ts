/** A failed request whose safe feedback has already been provided by its owner. */
export class ReportedSubmissionError extends Error {
  constructor() {
    super('Submission failed; feedback already reported.')

    this.name = 'ReportedSubmissionError'
  }
}
