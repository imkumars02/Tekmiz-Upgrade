import React from 'react';

const Working = () => {
  const styles = {
    translator: {
      padding: '3rem',
      height: 'auto',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      // Styles for the 'translator' container
    },
    container: {
      padding: '1rem',
      width: '56.25rem',
      backgroundColor: '#f5f5f5', // Example background color
      boxShadow: '0 0.125rem 1.25rem rgba(0, 0, 0, 0.3)',
      borderRadius: '0.5rem',
      overflow: 'hidden',
      // Styles for the 'container' within translator
    },
    translatorProperty: {
      border: '1px solid #c7c7c7', // Corrected border syntax
      // Styles for the 'translator_property' container
    },
    workingText: {
      backgroundColor: '#ffffff', // Example background color
      borderRadius: '0.5rem',
      padding: '1.5rem',
      textAlign: 'center',
      width: '100%',
      fontSize: '2rem',
      color: '#ff0000', // Example text color (red)
      // Styles for the text inside the 'workingText' class
    },
  };

  return (
    <div style={styles.translator}>
      <div style={styles.container}>
        <div style={styles.translatorProperty}>
          <p style={styles.workingText}>We are working now on it...</p>
        </div>
      </div>
    </div>
  );
};

export default Working;