const GITHUB_URL = 'https://github.com/qmup'

export function Credit() {
  return (
    <p className="text-center text-xs leading-relaxed text-neutral-500">
      Made by{' '}
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="credit-name inline-block font-semibold"
      >
        Quân Mụp
      </a>{' '}
      to practice for the AWS Certified Cloud Practitioner exam.
    </p>
  )
}
