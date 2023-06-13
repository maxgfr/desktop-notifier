type Props = {
  html: string;
};

function HtmlViewer({ html }: Props) {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        height: '100%',
        width: '100%',
      }}
    />
  );
}

export default HtmlViewer;
