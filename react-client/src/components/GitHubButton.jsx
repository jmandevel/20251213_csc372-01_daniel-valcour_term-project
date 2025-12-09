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

  return (
    <a 
      href={REPO_URL} 
      target="_blank" // open in new tab
      rel="noopener noreferrer" // dont allow data to pass to new page
      className="github-button"
    >
      GitHub Repository {issueCount !== null ? `(${issueCount} Issues)` : ''}
    </a>
  );
}

export default GitHubButton;
