type Props = {
  html: string;
};

function HtmlViewer({ html }: Props) {
  return (
    <iframe
      title="html-viewer"
      srcDoc={html}
      style={{
        height: '100%',
        width: '100%',
      }}
    />
  );
}

export default HtmlViewer;
