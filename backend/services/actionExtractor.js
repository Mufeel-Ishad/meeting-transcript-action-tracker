const nlp = require('compromise');
const natural = require('natural');

class ActionExtractor {
  constructor() {
    // Initialize tokenizer and stemmer
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
  }

  /**
   * Extract action items from transcript text
   * @param {string} text - Transcript text
   * @returns {Array} - Array of action items with owner and task
   */
  extractActions(text) {
    const actions = [];
    const sentences = this.splitIntoSentences(text);
    
    // Patterns to identify action items
    const actionPatterns = [
      /(?:will|should|must|need to|going to|plan to)\s+(.+?)(?:\.|$)/gi,
      /(?:action|task|todo|follow up|follow-up):\s*(.+?)(?:\.|$)/gi,
      /(?:assign|assigned to|owner|responsible):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:will|should|must|need to|going to)\s+(.+?)(?:\.|$)/gi,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:will|should|must|need to|going to)\s+(.+?)(?:\.|$)/gi,
    ];

    // Extract potential action sentences
    const actionSentences = [];
    sentences.forEach(sentence => {
      actionPatterns.forEach(pattern => {
        const matches = [...sentence.matchAll(pattern)];
        matches.forEach(match => {
          actionSentences.push({
            full: sentence,
            match: match[0],
            groups: match.slice(1)
          });
        });
      });
    });

    // Process each action sentence to extract owner and task
    actionSentences.forEach(({ full, groups }) => {
      const action = this.parseActionSentence(full, groups);
      if (action && action.task) {
        actions.push(action);
      }
    });

    // Remove duplicates and clean up
    return this.deduplicateActions(actions);
  }

  /**
   * Split text into sentences
   * @param {string} text - Input text
   * @returns {Array} - Array of sentences
   */
  splitIntoSentences(text) {
    // Simple sentence splitting (can be improved)
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /**
   * Parse a sentence to extract owner and task
   * @param {string} sentence - Action sentence
   * @param {Array} groups - Regex match groups
   * @returns {Object|null} - Action object with owner and task
   */
  parseActionSentence(sentence, groups) {
    const doc = nlp(sentence);
    
    // Try to extract person names (potential owners)
    const people = doc.people().out('array');
    const person = people.length > 0 ? people[0] : null;

    // Extract task description
    let task = sentence;
    
    // Remove common prefixes
    task = task.replace(/^(?:will|should|must|need to|going to|plan to)\s+/i, '');
    task = task.replace(/^(?:action|task|todo|follow up|follow-up):\s*/i, '');
    task = task.trim();

    // If we have groups from regex, use them
    if (groups && groups.length > 0) {
      if (groups.length === 1) {
        task = groups[0];
      } else if (groups.length === 2) {
        // First group might be owner, second is task
        const potentialOwner = groups[0];
        if (this.looksLikeName(potentialOwner)) {
          return {
            owner: potentialOwner,
            task: groups[1]
          };
        }
        task = groups[1];
      }
    }

    // If we found a person name, extract it as owner
    if (person) {
      // Remove the person's name from the task
      task = task.replace(new RegExp(person, 'gi'), '').trim();
      task = task.replace(/^(?:will|should|must|need to|going to)\s+/i, '').trim();
      
      return {
        owner: person,
        task: task || sentence
      };
    }

    // Try to find owner in the sentence using patterns
    const ownerPatterns = [
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:will|should|must|need to|going to)/,
      /(?:assign|assigned to|owner|responsible):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    ];

    for (const pattern of ownerPatterns) {
      const match = sentence.match(pattern);
      if (match && match[1]) {
        const potentialOwner = match[1];
        if (this.looksLikeName(potentialOwner)) {
          task = task.replace(new RegExp(potentialOwner, 'gi'), '').trim();
          task = task.replace(/^(?:will|should|must|need to|going to)\s+/i, '').trim();
          
          return {
            owner: potentialOwner,
            task: task || sentence
          };
        }
      }
    }

    // If no owner found, return task only
    return {
      owner: 'Unassigned',
      task: task || sentence
    };
  }

  /**
   * Check if a string looks like a person's name
   * @param {string} str - String to check
   * @returns {boolean}
   */
  looksLikeName(str) {
    if (!str || str.length < 2) return false;
    
    // Check if it starts with capital letter and has reasonable length
    const namePattern = /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/;
    if (!namePattern.test(str)) return false;
    
    // Exclude common action words
    const excludeWords = ['Action', 'Task', 'Todo', 'Follow', 'Up', 'Meeting', 'Project'];
    const words = str.split(/\s+/);
    if (words.some(w => excludeWords.includes(w))) return false;
    
    return true;
  }

  /**
   * Remove duplicate actions
   * @param {Array} actions - Array of actions
   * @returns {Array} - Deduplicated actions
   */
  deduplicateActions(actions) {
    const seen = new Set();
    const unique = [];

    actions.forEach(action => {
      const key = `${action.owner}|${action.task}`.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(action);
      }
    });

    return unique;
  }

  /**
   * Enhanced extraction with better NLP
   * @param {string} text - Transcript text
   * @returns {Array} - Array of action items
   */
  extractActionsEnhanced(text) {
    const actions = this.extractActions(text);
    
    // Post-process to improve quality
    return actions.map(action => ({
      owner: this.cleanOwner(action.owner),
      task: this.cleanTask(action.task)
    }));
  }

  /**
   * Clean owner name
   * @param {string} owner - Owner name
   * @returns {string} - Cleaned owner name
   */
  cleanOwner(owner) {
    if (!owner) return 'Unassigned';
    return owner.trim();
  }

  /**
   * Clean task description
   * @param {string} task - Task description
   * @returns {string} - Cleaned task description
   */
  cleanTask(task) {
    if (!task) return '';
    return task
      .trim()
      .replace(/^[:\-]\s*/, '') // Remove leading colon or dash
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
}

module.exports = new ActionExtractor();

