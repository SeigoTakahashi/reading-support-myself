import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { LABEL_TO_PATH } from "../../const";

// パンくずリスト
export default function Breadcrumb({ items }) {
  // 例: items = ['メイン', 'マイライブラリ', '本を追加']
  return (
    // overflow-hidden を追加して子要素の truncate が効くようにする
    <nav className="flex items-center gap-2 text-sm mb-6 overflow-hidden">
      {/* propsで受け取ったitemsを表示することで、パンくずリストを作成 */}
      {/* React.Fragmentは、複数の子要素をグループ化するために使用 */}
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
          )}
          {/* 末尾（現在地）の判定をし、スタイルを切り替え */}
          {index === items.length - 1 ? (
            // 末尾（現在地）は残りの幅を使い、縮小して省略されるようにする
            <span className="transition-colors text-gray-400 overflow-hidden truncate block flex-1 min-w-0">
              {item}
            </span>
          ) : (
            // メインやマイライブラリなどの先頭要素は折り返さず常に表示する
            <span className="transition-colors text-gray-900 hover:text-gray-600 underline whitespace-nowrap shrink-0">
              <Link to={LABEL_TO_PATH[item]} className="inline-block">
                {item}
              </Link>
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
