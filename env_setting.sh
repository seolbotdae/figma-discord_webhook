#!/bin/bash

echo "To use discord webhook, a webhook address is required."
echo ""
echo "Please select the task you want"

while true; do
    echo ""
    echo "1. Enter Address URL"
    echo "2. 현재 입력된 주소 확인하기"
    echo "3. 종료"
    echo ""
    read -p "선택 (1/2/3): " choice

    case $choice in
        1)
            read -p "discord webhook 주소를 입력하세요 : " url
            echo "$url"
            echo "WEBHOOK_URL=$url" > .env
            echo ""
            ;;
        2)
            # 파일에 적힌 내용 확인
            echo "현재 주소 확인하기:"
            cat .env
            echo ""
            ;;
        3)
            # 스크립트 종료
            echo "스크립트를 종료합니다."
            exit 0
            ;;
        *)
            # 잘못된 입력 처리
            echo "올바른 선택지를 입력하세요. (1/2/3)"
            ;;
    esac
done
