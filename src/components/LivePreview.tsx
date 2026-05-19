import { LiveProvider, LivePreview as ReactLivePreview, LiveError } from 'react-live';

interface LivePreviewProps {
  code: string;
  isStreaming?: boolean;
}

export function LivePreview({ code, isStreaming }: LivePreviewProps) {
  return (
    <div className="preview-panel">
      <div className="panel-header">
        <h3>미리보기</h3>
      </div>
      <div className="preview-content">
        {isStreaming ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '16px',
              color: '#666',
            }}
          >
            <div
              style={{
                fontSize: '24px',
                animation: 'spin 1s linear infinite',
              }}
            >
              ⟳
            </div>
            <p style={{ margin: 0 }}>컴포넌트를 생성하고 있습니다...</p>
          </div>
        ) : (
          <LiveProvider code={code} noInline>
            <div className="preview-render">
              <ReactLivePreview />
            </div>
            <LiveError className="preview-error" />
          </LiveProvider>
        )}
      </div>
    </div>
  );
}
