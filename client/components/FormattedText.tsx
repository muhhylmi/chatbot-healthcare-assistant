interface FormattedTextProps {
    text: string;
    className?: string;
  }
  
  export function FormattedText({ text, className = "" }: FormattedTextProps) {
    // Split text by \n\n and \n to handle line breaks
    const formatText = (text: string) => {
      return text.split('\n').map((line, index, array) => {
        if (line.trim() === '' && index < array.length - 1) {
          // Empty line - create paragraph break
          return <br key={index} />;
        }
        
        if (line.trim() === '') {
          return null; // Skip empty lines at the end
        }
  
        return (
          <span key={index}>
            {line}
            {index < array.length - 1 && <br />}
          </span>
        );
      });
    };
  
    return (
      <div className={className}>
        {formatText(text)}
      </div>
    );
  }
  