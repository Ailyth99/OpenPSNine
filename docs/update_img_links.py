# update_paths_for_deployment.py
import os
from bs4 import BeautifulSoup

# --- 配置 ---
# 请将这里替换成您的图床URL前缀
IMAGE_HOST_PREFIX = "https://www.modelscope.cn/studio/flyheadko/J2Z_experience/resolve/master/data/"
# 目标文件夹
TARGET_DIR = "saved_posts"

def update_html_image_paths():
    """
    遍历指定目录下的所有HTML文件，将本地图片路径更新为图床URL。
    """
    print("="*50)
    print("开始执行HTML图片路径批量更新任务...")
    print(f"目标文件夹: {TARGET_DIR}")
    print(f"图床URL前缀: {IMAGE_HOST_PREFIX}")
    print("="*50)

    if not os.path.isdir(TARGET_DIR):
        print(f"[错误] 目标目录 '{TARGET_DIR}' 不存在。")
        print("请确保此脚本与 'saved_posts' 文件夹在同一目录下。")
        return

    total_files_processed = 0
    total_links_updated = 0

    # 遍历 `saved_posts` 文件夹下的所有文件
    for filename in os.listdir(TARGET_DIR):
        if filename.endswith(".html"):
            file_path = os.path.join(TARGET_DIR, filename)
            print(f"  > 正在处理: {filename}")
            
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    soup = BeautifulSoup(content, "html.parser")
                
                images_in_file = soup.find_all('img')
                if not images_in_file:
                    print("    - 未找到 <img> 标签，跳过。")
                    continue

                links_found_in_file = 0
                for img in images_in_file:
                    if not img.has_attr('src'):
                        continue
                    
                    src = img['src']
                    
                    # 核心判断：只修改指向本地 'images/' 文件夹的链接
                    if src.startswith('images/'):
                        # 构建新的URL
                        new_src = IMAGE_HOST_PREFIX + src
                        img['src'] = new_src
                        links_found_in_file += 1
                
                # 如果有更新，则写回文件
                if links_found_in_file > 0:
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(str(soup))
                    print(f"    ✔ 完成！更新了 {links_found_in_file} 个图片链接。")
                    total_links_updated += links_found_in_file
                else:
                    print("    - 无需更新此文件的图片链接。")
                
                total_files_processed += 1
            
            except Exception as e:
                print(f"    [!] 处理文件 {filename} 时发生错误: {e}")

    print("\n" + "="*50)
    print("任务全部完成！")
    print(f"总共检查了 {total_files_processed} 个HTML文件。")
    print(f"总共更新了 {total_links_updated} 个图片链接。")
    print(f"现在您的 '{TARGET_DIR}' 文件夹已准备好进行部署！")
    print("="*50)

if __name__ == "__main__":
    # 在运行前，给用户一个明确的提示
    print("【警告】此脚本将直接修改 'saved_posts' 文件夹内的所有HTML文件。")
    print("这是一个不可逆的操作。建议您在运行前备份 'saved_posts' 文件夹。")
    proceed = input("您确定要继续吗？ (输入 'yes' 继续): ")
    
    if proceed.lower() == 'yes':
        update_html_image_paths()
    else:
        print("操作已取消。")