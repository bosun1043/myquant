
if **name** == '__main__':
    create_overview_visualizations(main)

위 코드에서 빈칸에 들어갈 올바른 답은 무엇인가요?

main
"main"
"_main"

__ dunder = double underscore 
던더 특수 메서드나 변수를 나타는데 서용
 - 파이썬 인터프리터에 특별하게 처리되는게 있어 -> 특정 기능을 구현할때 사용하는데 

 __init__ : 클래스의 인스턴스가 생성될때 호출되는 메서드 
 __str__: 객처를 문자열로 표현하기 위한 메서드 
 __len__: 객체의 길이를 반환하는 메서드 
 __file__: 현재 실행 중인 파일의 경로를 담고 있는 변수 

이런 특수 이름들을 직접 지정하거나 호출하기보다는 파이썬 있는 내장 기능을 통해 간접적으로 사용함!! 



1. 다음 HTML 태그 중 웹 페이지의 메타데이터를 정의하는 태그는 무엇인가요?
   a) `<body>`
   b) `<head>`
   c) `<div>`
   d) `<meta>`

2. 파이썬 웹 프레임워크 중 'routes'를 정의하는 코드에서 빈칸에 들어갈 올바른 표현은?
   ```python
   @app.__route_('/home')
   def home():
       return render_template('home.html')

   ```
URL 경로 홈를 해당 함수(home)을 연결하죠. 그럼 사용자가 /home URL 접속할때 어떤 함수가 실행되어야 하는지 웹 서버에 알려주죠!! 

3. CSS에서 클래스 선택자를 사용할 때 올바른 문법은 무엇인가요?
   a) `#navbar` = ID 선택자 
   b) `.navbar`
   c) `*navbar` = 없어요. 이런 문법 없어요 !!!!!!!!!!
   d) `@navbar` = html , class = "navbar" , 클래스 선택 .navbar는 .navbar 

css 에서는 클래스 선택자 마침료 시작함!!! navbar는 

4. 다음 중 JavaScript에서 비동기 데이터 요청을 처리하는 함수는?
   a) `fetch()`
   b) `console.log()`
   c) `document.getElementById()`
   d) `Math.random()`

5. 파이썬 Flask 웹 애플리케이션에서 HTML 템플릿을 렌더링하는 올바른 함수는?
   a) `display_html()`
   b) `return_html()`
   c) `render_template()`
   d) `show_page()`

---------------------------------------------------------------------------------
def process_data():
    # 데이터 처리 코드
    
if **____** == "**____**":
    process_data()

__name__, __file__
__name__, __main__
__main__, __name__
__file__, __main__

if __name__ == "__main__" 는 스크립트가 직접 실행될 때만 저 위 함수를 호출하고, 모듈로 가져올 때는 실행하지 않음 

---------------------------------------------------------------------------------

from flask import Flask, render_template

app = Flask(__name__)

@app.**____**('/dashboard')
def dashboard():
    return render_template('dashboard.html')

url
link
route
path

---------------------------------------------------------------------------------
from django.db import models

class Student(models.Model):
    name = models.**____**(max_length=100)
    email = models.**____**(max_length=100, unique=True)
    age = models.**____**(default=0)
    enrolled_date = models.**____**(auto_now_add=True)

1. CharField, EmailField, IntegerField, DateTimeField
2. StringField, EmailField, NumberField, DateField
3. TextField, StringField, IntField, TimeField
4. VarcharField, MailField, IntegerField, DateField

charField = 문자열 
IntegerField = 정수 
EmailField = 이메일 주소 (@)
DateTimeField= 12:43

---------------------------------------------------------------------------------

import pandas as pd

def clean_education_data(file_path):
    # 데이터 로드
    df = pd.read_csv(file_path)
    
    # 결측치 처리
    df = df.**____**(subset=['school_code', 'school_name'])
    
    # 중복 데이터 제거
    df = df.**____**(subset=['school_code'])
    
    # 열 이름 변경
    df = df.**____**(columns={'schoolName': 'sschool_name'})
    
    return df

1. dropna, drop_duplicates, rename
2. fillna, remove_duplicates, change_names
3. remove_null, unique, alter_columns
4. delete_nulls, distinct, modify_columns


---------------------------------------------------------------------------------
FastAPI를 사용한 비동기 API 엔드포인트에 들어갈 빈칸!! 

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class StudentCreate(BaseModel):
    name: str
    email: str
    age: int

@app.post("/students/")
**____** def create_student(student: StudentCreate):
    # 데이터베이스에 학생 정보 저장
    **____** save_to_database(student)
    return {"message": "Student created successfully"}

1. async, await
2. sync, wait
3. concurrent, yield
4. parallel, async

async는 함수가 비동기적으로 실행될 수 있다는걸 말해주고 
await 비동기 함수의 결과를 기다리는 데 사용함!! 



import logging

# 로깅 설정
logging.**____**(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.**____**(filename='app.log'),
        logging.**____**()
    ]
)

logger = logging.**____**(__name__)

try:
    result = some_function()
    logger.info("작업 완료: %s", result)
except Exception as e:
    logger.**____**("오류 발생: %s", str(e))


get 104 
status_code 404 


파이썬의 로깅 모듈은 이벤트를 기록하는데 사용해요!! 
이벤트란? -> debug, info, warning, error 
로그 메시지에 사용해요. 