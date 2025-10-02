import React from 'react';
import JournalTool from './JournalTool';
import TextTool from './TextTool';
import RatingTool from './RatingTool';
import MCQSingleTool from './MCQSingleTool';
import MCQMultiTool from './MCQMultiTool';
import ChatBotTool from './ChatBotTool';

/**
 * Factory component that renders the appropriate tool based on toolType
 */
const ToolFactory = ({ tool, onChange, readOnly = false }) => {
  switch (tool.toolType) {
    case 'JOURNAL':
      return <JournalTool tool={tool} onChange={onChange} readOnly={readOnly} />;
      
    case 'TEXT':
      return <TextTool tool={tool} onChange={onChange} readOnly={readOnly} />;
      
    case 'RATING':
      return <RatingTool tool={tool} onChange={onChange} readOnly={readOnly} />;
      
    case 'MCQ_SINGLE':
      return <MCQSingleTool tool={tool} onChange={onChange} readOnly={readOnly} />;
      
    case 'MCQ_MULTISELECT':
      return <MCQMultiTool tool={tool} onChange={onChange} readOnly={readOnly} />;

    case 'CHAT_BOT':
      return <ChatBotTool tool={tool} onChange={onChange} readOnly={readOnly} />;
      
    default:
      return (
        <div>
          Unsupported tool type: {tool.toolType}
        </div>
      );
  }
};

export default ToolFactory;
