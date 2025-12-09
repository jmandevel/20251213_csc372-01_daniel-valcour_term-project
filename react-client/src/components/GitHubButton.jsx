import { useState, useEffect } from 'react';
import './GitHubButton.css';

function GitHubButton() {
  const [issueCount, setIssueCount] = useState(null);
  const REPO_OWNER = 'jmandevel';
  const REPO_NAME = '20251213_csc372-01_daniel-valcour_term-project';
  const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;

  useEffect(() => {
    fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`)
      .then(res => res.json())
      .then(data => {
        if (data.open_issues_count !== undefined) {
          setIssueCount(data.open_issues_count);
        }
      })
      .catch(err => console.error('Failed to fetch GitHub issues:', err));
  }, []);

  const handleClick = () => {
    window.open(REPO_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleClick}
      className="github-button"
    >
      GitHub Repository {issueCount !== null ? `(${issueCount} Issues)` : ''}
    </button>
  );
}

export default GitHubButton;
