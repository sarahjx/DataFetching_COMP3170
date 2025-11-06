import { useState, useEffect } from 'react'
import './App.css'
import sampleBooks from './data/books.json'

function Book({ title, author, image, publisher, price, published, pages, url, isSelected, onSelect, isOnLoan, onViewDetails }) {
  const handleBookClick = () => {
    onSelect();
  };

  const handleViewDetailsClick = (e) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails();
    }
  };

  return (
    <div 
      className={`book ${isSelected ? 'selected' : ''} ${isOnLoan ? 'on-loan' : ''}`}
      onClick={handleBookClick}
    >
      {image && <img src={image} alt={title} className="book-image" />}
      <h3>{title}</h3>
      <p className="author">{author || 'Unknown Author'}</p>
      <p className="published-info">
        Published: {published || '2025'} • {pages || 499} pages
      </p>
      {price && <p className="price">{price}</p>}
      <button 
        className="view-details-button" 
        onClick={handleViewDetailsClick}
      >
        View Details
      </button>
      {isOnLoan && <p className="loan-status">On Loan</p>}
    </div>
  )
}

function BookModal({ isOpen, onClose, onSaveBook, bookToEdit, mode }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    publisher: '',
    url: ''
  });

  useEffect(() => {
    if (mode === 'edit' && bookToEdit) {
      setFormData({
        title: bookToEdit.title || '',
        author: bookToEdit.author || '',
        publisher: bookToEdit.publisher || '',
        url: bookToEdit.image || ''
      });
    } else {
      setFormData({
        title: '',
        author: '',
        publisher: '',
        url: ''
      });
    }
  }, [bookToEdit, mode, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveBook({
      title: formData.title,
      author: formData.author,
      publisher: formData.publisher,
      image: formData.url,
    });
    onClose();
    setFormData({
      title: '',
      author: '',
      publisher: '',
      url: ''
    });
  };

  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleModalClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{mode === 'edit' ? 'Edit Book' : 'Add New Book'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="book-form">
          <div className="form-group">
            <label htmlFor="title">Title:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="author">Author:</label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="publisher">Publisher:</label>
            <input
              type="text"
              id="publisher"
              name="publisher"
              value={formData.publisher}
              onChange={handleInputChange}
              placeholder="e.g., Penguin Random House"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="url">Cover Image URL:</label>
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              placeholder="https://example.com/image.png"
              required
            />
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button">
              {mode === 'edit' ? 'Update Book' : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BookDetails({ book, onClose }) {
  const [similarBooks, setSimilarBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSimilarBooks = async () => {
      if (!book) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Extract meaningful keywords from title and author
        const extractKeywords = (text) => {
          if (!text) return [];
          // Common words to exclude
          const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'from', 'by', 'about', 'into', 'through', 'during', 'including', 'against', 'among', 'throughout', 'despite', 'towards', 'upon', 'concerning', 'to', 'of', 'in', 'for', 'on', 'at', 'by', 'with', 'about', 'into', 'through', 'during', 'under', 'over', 'after', 'before', 'above', 'below', 'up', 'down', 'out', 'off', 'away', 'back', 'along', 'around', 'across', 'behind', 'beyond', 'near', 'inside', 'outside', 'within', 'without'];
          
          return text
            .toLowerCase()
            .split(/[\s,.-]+/)
            .filter(word => 
              word.length > 2 && 
              !stopWords.includes(word) &&
              !/^\d+$/.test(word) // Exclude pure numbers
            )
            .slice(0, 3); // Take first 3 meaningful words
        };
        
        // Get keywords from title and author
        const titleKeywords = extractKeywords(book.title);
        const authorKeywords = extractKeywords(book.author);
        
        // Combine keywords, prioritizing title keywords
        const allKeywords = [...titleKeywords, ...authorKeywords];
        const uniqueKeywords = [...new Set(allKeywords)];
        
        // Create multiple search queries with different keyword combinations
        const searchQueries = [];
        if (uniqueKeywords.length > 0) {
          // Try with more keywords (up to 4)
          searchQueries.push(uniqueKeywords.slice(0, 4).join(' '));
          // Try with first 3 keywords
          if (uniqueKeywords.length >= 3) {
            searchQueries.push(uniqueKeywords.slice(0, 3).join(' '));
          }
          // Try with first 2 keywords
          if (uniqueKeywords.length >= 2) {
            searchQueries.push(uniqueKeywords.slice(0, 2).join(' '));
          }
          // Try with just the first keyword
          searchQueries.push(uniqueKeywords[0]);
        } else {
          // Fallback to generic search
          searchQueries.push('javascript');
        }
        
        // Remove duplicates
        const uniqueQueries = [...new Set(searchQueries)];
        
        console.log('Search keywords:', uniqueKeywords);
        console.log('Search queries to try:', uniqueQueries);
        
        // Try each query until one succeeds
        let data = null;
        let lastError = null;
        
        for (const searchQuery of uniqueQueries) {
          const searchQueryEncoded = encodeURIComponent(searchQuery);
          const apiUrl = `https://api.itbook.store/1.0/search/${searchQueryEncoded}`;
          const apiUrlUnencoded = `https://api.itbook.store/1.0/search/${searchQuery}`;
          
          console.log(`Trying search query: "${searchQuery}"`);
          
          // Call API directly
          let response;
          let queryData = null;
          let querySuccess = false;
          
          try {
            response = await fetch(apiUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              },
            });
            
            if (!response.ok) {
              throw new Error(`API returned ${response.status} ${response.statusText}`);
            }
            
            queryData = await response.json();
            console.log('Successfully fetched from API');
            querySuccess = true;
          } catch (fetchError) {
            console.error('Direct API call failed:', fetchError);
            // If CORS error, try with Vite proxy first, then public CORS proxy
            if (fetchError.message.includes('CORS') || fetchError.message.includes('Failed to fetch')) {
              console.log('CORS error detected, trying Vite proxy as fallback');
              try {
                const proxyUrl = `/api/search/${searchQueryEncoded}`;
                response = await fetch(proxyUrl);
                if (response.ok) {
                  queryData = await response.json();
                  console.log('Successfully fetched via Vite proxy fallback');
                  querySuccess = true;
                } else {
                  throw new Error(`Proxy returned ${response.status}`);
                }
              } catch (proxyError) {
                console.log('Vite proxy failed:', proxyError);
                console.log('Trying public CORS proxy');
                // Try public CORS proxy as last resort
                try {
                  // Use the properly encoded URL - the proxy will handle it correctly
                  // We need to encode the entire URL for the query parameter
                  const corsProxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;
                  console.log('Fetching from CORS proxy:', corsProxyUrl);
                  response = await fetch(corsProxyUrl);
                  console.log('CORS proxy response status:', response.status);
                  if (response.ok) {
                    const proxyData = await response.json();
                    // allorigins.win wraps the response in a "contents" field
                    if (proxyData.contents) {
                      const text = proxyData.contents;
                      // Check if response is HTML (error page)
                      if (text.trim().startsWith('<!')) {
                        throw new Error('Proxy returned HTML instead of JSON');
                      }
                      queryData = JSON.parse(text);
                      console.log('Successfully fetched via public CORS proxy');
                      querySuccess = true;
                    } else {
                      throw new Error('Unexpected proxy response format');
                    }
                  } else {
                    throw new Error(`CORS proxy returned ${response.status}`);
                  }
                } catch (corsProxyError) {
                  console.error('CORS proxy failed for this query:', corsProxyError);
                  lastError = corsProxyError;
                  // Continue to next query
                }
              }
            } else {
              lastError = fetchError;
              // Continue to next query
            }
          }
          
          // If this query succeeded, use the data and break
          if (querySuccess && queryData) {
            data = queryData;
            console.log(`Successfully fetched data using query: "${searchQuery}"`);
            break;
          }
        }
        
        // If no query succeeded, show error
        if (!data) {
          setError('Unable to fetch similar books due to CORS restrictions. Please try again later.');
          setSimilarBooks([]);
          setLoading(false);
          return;
        }
        
        // If we got here, we successfully fetched data
        console.log('API Response:', data);
        
        // Check if API returned an error
        if (data.error && data.error !== "0") {
          console.warn('API returned error:', data.error);
          setSimilarBooks([]);
          return;
        }
        
        // Check if data.books exists and is an array
        if (!data.books || !Array.isArray(data.books)) {
          console.warn('Unexpected API response structure:', data);
          setSimilarBooks([]);
          return;
        }
        
        // Filter out the current book by title and limit to 6 similar books
        const filtered = data.books
          .filter(b => {
            // Check if book exists and has a title
            if (!b || !b.title) return false;
            // Filter out exact title matches (case insensitive)
            return b.title.toLowerCase() !== book.title?.toLowerCase();
          })
          .slice(0, 6);
        
        console.log('Filtered similar books:', filtered);
        
        // Fetch detailed information for each similar book using ISBN13
        const fetchBookDetails = async (isbn13) => {
          try {
            const detailUrl = `https://api.itbook.store/1.0/books/${isbn13}`;
            let detailResponse;
            
            try {
              detailResponse = await fetch(detailUrl);
            } catch (directError) {
              // Try Vite proxy
              try {
                const proxyUrl = `/api/books/${isbn13}`;
                detailResponse = await fetch(proxyUrl);
              } catch (proxyError) {
                // Try public CORS proxy as last resort
                const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(detailUrl)}`;
                detailResponse = await fetch(corsProxyUrl);
                if (detailResponse.ok) {
                  const text = await detailResponse.text();
                  if (!text.trim().startsWith('<!')) {
                    return JSON.parse(text);
                  }
                }
              }
            }
            
            if (detailResponse && detailResponse.ok) {
              const text = await detailResponse.text();
              // Handle allorigins.win wrapper format
              if (text.includes('"contents"')) {
                const wrapper = JSON.parse(text);
                return JSON.parse(wrapper.contents);
              }
              return JSON.parse(text);
            }
          } catch (err) {
            // Silently fail - we'll use search results instead
            console.warn(`Failed to fetch details for ISBN ${isbn13}:`, err);
          }
          return null;
        };
        
        // If we have books from search, use them directly (details fetching is optional)
        if (filtered.length > 0) {
          // Try to fetch details, but don't fail if it doesn't work
          try {
            const booksWithDetails = await Promise.all(
              filtered.map(async (similarBookItem) => {
                if (similarBookItem.isbn13) {
                  const details = await fetchBookDetails(similarBookItem.isbn13);
                  // Merge search result with detailed information if available
                  return details ? { ...similarBookItem, ...details } : similarBookItem;
                }
                return similarBookItem;
              })
            );
            
            console.log('Similar books with details:', booksWithDetails);
            setSimilarBooks(booksWithDetails);
          } catch (detailError) {
            // If detail fetching fails, just use search results
            console.warn('Failed to fetch details, using search results:', detailError);
            setSimilarBooks(filtered);
          }
        } else {
          setSimilarBooks([]);
        }
      } catch (err) {
        console.error('Error fetching similar books:', err);
        // More detailed error message
        let errorMessage = 'Failed to load similar books';
        if (err.message) {
          errorMessage = err.message;
        } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
          errorMessage = 'Network error: Unable to connect to the API. Please check your internet connection.';
        }
        setError(errorMessage);
        setSimilarBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarBooks();
  }, [book]);

  if (!book) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="book-details-overlay" onClick={handleOverlayClick}>
      <div className="book-details-container">
        <button className="close-details-button" onClick={onClose}>×</button>
        
        <div className="book-details-content">
          <div className="book-details-main">
            {book.image && (
              <img src={book.image} alt={book.title} className="book-details-image" />
            )}
            <div className="book-details-info">
              <h2>{book.title}</h2>
              <p className="book-detail-item"><strong>Author:</strong> {book.author || 'Unknown Author'}</p>
              {book.publisher && <p className="book-detail-item"><strong>Publisher:</strong> {book.publisher}</p>}
              <p className="book-detail-item"><strong>Published:</strong> {book.published || '2025'}</p>
              <p className="book-detail-item"><strong>Pages:</strong> {book.pages || 499}</p>
              {book.price && <p className="book-detail-item"><strong>Price:</strong> {book.price}</p>}
              {book.url && (
                <a 
                  href={book.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="external-link-button"
                >
                  View on IT Book Store
                </a>
              )}
            </div>
          </div>

          <div className="similar-books-section">
            <h3>Similar Books</h3>
            {loading && <p className="loading-message">Loading similar books...</p>}
            {error && <p className="error-message">Error loading similar books: {error}</p>}
            {!loading && !error && similarBooks.length === 0 && (
              <p className="no-similar-books">No similar books found.</p>
            )}
            {!loading && !error && similarBooks.length > 0 && (
              <div className="similar-books-grid">
                {similarBooks.map((similarBook, index) => (
                  <div key={similarBook.isbn13 || index} className="similar-book-card">
                    {similarBook.image && (
                      <img src={similarBook.image} alt={similarBook.title || 'Book cover'} className="similar-book-image" />
                    )}
                    <h4>{similarBook.title || 'Untitled'}</h4>
                    {similarBook.subtitle && <p className="similar-book-subtitle">{similarBook.subtitle}</p>}
                    {similarBook.price && <p className="similar-book-price">{similarBook.price}</p>}
                    {similarBook.url && (
                      <a 
                        href={similarBook.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="similar-book-link"
                      >
                        View Details
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoanManagement({ books, loans, onAddLoan, onClearAllLoans }) {
  const [formData, setFormData] = useState({
    borrower: '',
    bookId: '',
    loanPeriod: 1
  });

  // Get available books (not currently on loan)
  const availableBooks = books.filter(book => {
    return !loans.some(loan => loan.bookId === book.id);
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'loanPeriod' ? parseInt(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.borrower && formData.bookId) {
      // Convert bookId to number to match book.id type
      const bookId = typeof formData.bookId === 'string' 
        ? parseFloat(formData.bookId) 
        : formData.bookId;
      
      onAddLoan({
        borrower: formData.borrower,
        bookId: bookId,
        loanPeriod: formData.loanPeriod,
        loanDate: new Date().toISOString()
      });
      setFormData({
        borrower: '',
        bookId: '',
        loanPeriod: 1
      });
    }
  };

  // Get loaned books with full details
  const loanedBooksList = loans.map(loan => {
    const book = books.find(b => b.id === loan.bookId);
    if (!book) return null;
    
    const loanDate = new Date(loan.loanDate);
    const dueDate = new Date(loanDate);
    dueDate.setDate(dueDate.getDate() + (loan.loanPeriod * 7));
    
    return {
      ...loan,
      bookTitle: book.title,
      dueDate: dueDate.toLocaleDateString()
    };
  }).filter(Boolean);

  return (
    <div className="loan-management">
      <h2>Loan Management</h2>
      
      {availableBooks.length > 0 ? (
        <form onSubmit={handleSubmit} className="loan-form">
          <div className="form-group">
            <label htmlFor="borrower">Borrower Name:</label>
            <input
              type="text"
              id="borrower"
              name="borrower"
              value={formData.borrower}
              onChange={handleInputChange}
              required
              placeholder="Enter borrower's name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="bookId">Book:</label>
            <select
              id="bookId"
              name="bookId"
              value={formData.bookId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a book</option>
              {availableBooks.map(book => (
                <option key={book.id} value={book.id}>
                  {book.title}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="loanPeriod">Loan Period (weeks):</label>
            <input
              type="number"
              id="loanPeriod"
              name="loanPeriod"
              value={formData.loanPeriod}
              onChange={handleInputChange}
              min="1"
              max="4"
              required
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="submit-button">
              Create Loan
            </button>
          </div>
        </form>
      ) : (
        <div className="no-books-message">
          <p>All books are currently on loan.</p>
        </div>
      )}
      
      <div className="loaned-books-section">
        <div className="loaned-books-header">
          <h3>Loaned Books</h3>
          {loanedBooksList.length > 0 && (
            <button 
              className="clear-loans-button" 
              onClick={onClearAllLoans}
            >
              Clear All Loans
            </button>
          )}
        </div>
        {loanedBooksList.length > 0 ? (
          <div className="loaned-books-list">
            {loanedBooksList.map((loan, index) => (
              <div key={index} className="loaned-book-item">
                <p><strong>Borrower:</strong> {loan.borrower}</p>
                <p><strong>Book:</strong> {loan.bookTitle}</p>
                <p><strong>Due Date:</strong> {loan.dueDate}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-loans-message">
            <p>No books are currently on loan.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  // Load books from localStorage or initialize with sample books
  const [books, setBooks] = useState(() => {
    const savedBooks = localStorage.getItem('books');
    if (savedBooks) {
      const parsed = JSON.parse(savedBooks);
      // If localStorage has books, use them; otherwise initialize with sample books
      if (parsed && parsed.length > 0) {
        return parsed;
      }
    }
    // Initialize with sample books from books.json
    // Page counts: 499, 510, 357, 420, 380, 450, 365, 395, 410, 340
    const pageCounts = [499, 510, 357, 420, 380, 450, 365, 395, 410, 340];
    return sampleBooks.map((book, index) => ({
      id: Date.now() + index,
      title: book.title,
      author: book.subtitle || '',
      publisher: '',
      image: book.image,
      price: book.price || '',
      published: '2025',
      pages: pageCounts[index] || 499,
      url: book.url || '',
      selected: false
    }));
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' or 'edit'
  const [bookToEdit, setBookToEdit] = useState(null)
  const [filterPublisher, setFilterPublisher] = useState('all')
  const [currentView, setCurrentView] = useState('books') // 'books' or 'loans'
  const [selectedBookDetails, setSelectedBookDetails] = useState(null) // Book to show in details view
  
  // Load loans from localStorage or start with empty array
  const [loans, setLoans] = useState(() => {
    const savedLoans = localStorage.getItem('loans');
    return savedLoans ? JSON.parse(savedLoans) : [];
  })

  // Initialize sample books on first mount if books array is empty
  useEffect(() => {
    // Check if we have no books (either from localStorage being empty or having empty array)
    if (books.length === 0) {
      // Page counts: 499, 510, 357, 420, 380, 450, 365, 395, 410, 340
      const pageCounts = [499, 510, 357, 420, 380, 450, 365, 395, 410, 340];
      const initializedBooks = sampleBooks.map((book, index) => ({
        id: Date.now() + index,
        title: book.title,
        author: book.subtitle || '',
        publisher: '',
        image: book.image,
        price: book.price || '',
        published: '2025',
        pages: pageCounts[index] || 499,
        url: book.url || '',
        selected: false
      }));
      setBooks(initializedBooks);
    } else {
      // Migrate existing books to add missing fields
      const pageCounts = [499, 510, 357, 420, 380, 450, 365, 395, 410, 340];
      const updatedBooks = books.map((book, index) => {
        // Find matching sample book if available
        const sampleBook = sampleBooks.find(sb => sb.title === book.title);
        return {
          ...book,
          price: book.price || sampleBook?.price || '',
          published: book.published || '2025',
          pages: book.pages || pageCounts[index % pageCounts.length] || 499,
          url: book.url || sampleBook?.url || ''
        };
      });
      // Only update if something changed
      if (JSON.stringify(books) !== JSON.stringify(updatedBooks)) {
        setBooks(updatedBooks);
      }
    }
  }, []); // Run only on mount

  // Save books to localStorage whenever books change
  useEffect(() => {
    localStorage.setItem('books', JSON.stringify(books));
  }, [books]);

  // Save loans to localStorage whenever loans change
  useEffect(() => {
    localStorage.setItem('loans', JSON.stringify(loans));
  }, [loans]);

  const handleAddBook = () => {
    setModalMode('add');
    setBookToEdit(null);
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setBookToEdit(null);
  }

  const handleSaveBook = (bookData) => {
    if (modalMode === 'edit' && bookToEdit) {
      // Update existing book
      setBooks(books.map(book => 
        book.id === bookToEdit.id 
          ? { ...book, ...bookData, selected: false }
          : book
      ))
    } else {
      // Add new book
      const bookWithId = {
        ...bookData,
        id: Date.now() + Math.random(),
        selected: false
      }
      setBooks([...books, bookWithId])
    }
  }

  const handleBookSelect = (bookId) => {
    // Deselect all books first, then select the clicked one
    setBooks(books.map(book => ({
      ...book,
      selected: book.id === bookId ? !book.selected : false
    })))
  }

  const handleDeleteSelected = () => {
    setBooks(books.filter(book => !book.selected))
  }

  const handleUpdateSelected = () => {
    const selectedBook = books.find(book => book.selected);
    if (selectedBook) {
      setModalMode('edit');
      setBookToEdit(selectedBook);
      setIsModalOpen(true);
    }
  }

  // Get unique publishers for filter dropdown
  const publishers = ['all', ...new Set(books.map(book => book.publisher).filter(Boolean))];

  // Filter books based on selected publisher
  const filteredBooks = filterPublisher === 'all'
    ? books
    : books.filter(book => book.publisher === filterPublisher);

  // Handle adding a new loan
  const handleAddLoan = (loanData) => {
    setLoans([...loans, loanData]);
  };

  // Handle clearing all loans
  const handleClearAllLoans = () => {
    setLoans([]);
    localStorage.removeItem('loans');
  };

  // Check if a book is on loan
  const isBookOnLoan = (bookId) => {
    return loans.some(loan => {
      // Compare as both string and number to handle type mismatches
      return loan.bookId == bookId; // Use == for type coercion
    });
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Sarah's Awesome Book Catalog</h1>
        <div className="header-controls">
          <div className="filter-container">
            <label htmlFor="publisher-filter" className="filter-label">
              Filter by Publisher:
            </label>
            <select
              id="publisher-filter"
              className="filter-select"
              value={filterPublisher}
              onChange={(e) => setFilterPublisher(e.target.value)}
              disabled={currentView === 'loans'}
            >
              {publishers.map(publisher => (
                <option key={publisher} value={publisher}>
                  {publisher === 'all' ? 'All Publishers' : publisher}
                </option>
              ))}
            </select>
          </div>
          <div className="view-toggle">
            <button 
              className={`view-button ${currentView === 'books' ? 'active' : ''}`}
              onClick={() => setCurrentView('books')}
            >
              Book Listing
            </button>
            <button 
              className={`view-button ${currentView === 'loans' ? 'active' : ''}`}
              onClick={() => setCurrentView('loans')}
            >
              Loan Management
            </button>
          </div>
        </div>
      </header>
      
      <main className="main-content">
        {selectedBookDetails ? (
          <BookDetails 
            book={selectedBookDetails} 
            onClose={() => setSelectedBookDetails(null)}
          />
        ) : currentView === 'books' ? (
          <div className="container">
            <div className="controls">
              <div className="add-book-card" onClick={handleAddBook}>
                <div className="add-book-text">Add Book +</div>
              </div>
              <div className="action-buttons">
                <button className="edit-button" onClick={handleUpdateSelected}>
                  Edit
                </button>
                <button className="delete-button" onClick={handleDeleteSelected}>
                  Delete
                </button>
              </div>
            </div>
            <div className="books-grid">
              {filteredBooks.length === 0 ? (
                <div className="no-books-message">
                  <p>No books to display{filterPublisher !== 'all' && ` for ${filterPublisher}`}</p>
                </div>
              ) : (
                filteredBooks.map((book) => (
                  <Book 
                    key={book.id} 
                    title={book.title} 
                    author={book.author}
                    image={book.image}
                    publisher={book.publisher}
                    price={book.price}
                    published={book.published}
                    pages={book.pages}
                    url={book.url}
                    isSelected={book.selected}
                    onSelect={() => handleBookSelect(book.id)}
                    isOnLoan={isBookOnLoan(book.id)}
                    onViewDetails={() => setSelectedBookDetails(book)}
                  />
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="loan-management-container">
            <LoanManagement 
              books={books} 
              loans={loans} 
              onAddLoan={handleAddLoan}
              onClearAllLoans={handleClearAllLoans}
            />
          </div>
        )}
      </main>
      
      <footer className="footer">
        <p>© 2025 Sarah's Book Catalog</p>
      </footer>

      <BookModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        onSaveBook={handleSaveBook}
        bookToEdit={bookToEdit}
        mode={modalMode}
      />
    </div>
  )
}

export default App
