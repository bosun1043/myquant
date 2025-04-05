"""
교육 데이터 통합 스크립트 (Education Data Integration Script)

이 스크립트는 다양한 교육 관련 데이터셋을 학교 코드를 기준으로 통합합니다.
통합되는 데이터셋:
1. API 데이터 (education_data_20250331.csv)
2. KESS 통계 데이터 (kess_stats_20250331.csv)
3. 학교 디지털 인프라 데이터 (school_digital_infra.csv)

작성자: Jessica Kang
최종 수정일: 2025-03-31
"""

import pandas as pd
import numpy as np
import logging
from typing import Optional, List, Dict
import os

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class EducationDataIntegrator:
    """교육 데이터 통합을 위한 클래스"""
    
    def __init__(self, input_files: Dict[str, str], output_file: str):
        """
        Parameters:
        -----------
        input_files : Dict[str, str]
            통합할 입력 파일들의 딕셔너리 (데이터 유형: 파일 경로)
        output_file : str
            통합된 데이터를 저장할 파일 경로
        """
        self.input_files = input_files
        self.output_file = output_file
        self.datasets = {}
        
    def load_datasets(self) -> bool:
        """
        모든 입력 데이터셋을 로드합니다.
        
        Returns:
        --------
        bool
            데이터 로드 성공 여부
        """
        try:
            for data_type, file_path in self.input_files.items():
                if not os.path.exists(file_path):
                    logger.error(f"파일을 찾을 수 없습니다: {file_path}")
                    return False
                    
                logger.info(f"{data_type} 데이터 로드 중...")
                self.datasets[data_type] = pd.read_csv(file_path)
                logger.info(f"{data_type} 데이터 로드 완료: {len(self.datasets[data_type])} 행")
            return True
        except Exception as e:
            logger.error(f"데이터 로드 중 오류 발생: {str(e)}")
            return False
    
    def preprocess_data(self):
        """데이터 전처리를 수행합니다."""
        try:
            # 컬럼명 통일
            if 'schoolCode' in self.datasets['api'].columns:
                self.datasets['api'].rename(columns={'schoolCode': 'school_code'}, inplace=True)
            if '학교코드' in self.datasets['kess'].columns:
                self.datasets['kess'].rename(columns={'학교코드': 'school_code'}, inplace=True)
            
            # 데이터 타입 변환
            for name, df in self.datasets.items():
                if 'school_code' in df.columns:
                    df['school_code'] = df['school_code'].astype(str)
                    logger.info(f"{name} 데이터의 school_code를 문자열로 변환 완료")
        except Exception as e:
            logger.error(f"데이터 전처리 중 오류 발생: {str(e)}")
            raise
    
    def merge_datasets(self) -> Optional[pd.DataFrame]:
        """
        데이터셋을 통합합니다.
        
        Returns:
        --------
        pd.DataFrame or None
            통합된 데이터프레임 또는 오류 발생 시 None
        """
        try:
            # 1단계: API 데이터와 학교 인프라 데이터 병합
            merged_data = pd.merge(
                self.datasets['api'],
                self.datasets['infra'],
                on='school_code',
                how='left'
            )
            logger.info("1단계 병합 완료: API + 인프라 데이터")
            
            # 2단계: KESS 데이터 병합
            final_data = pd.merge(
                merged_data,
                self.datasets['kess'],
                on='school_code',
                how='left'
            )
            logger.info("2단계 병합 완료: + KESS 데이터")
            
            # 중복 컬럼 처리
            duplicate_cols = [col for col in final_data.columns if col.endswith('_x')]
            for col in duplicate_cols:
                base_col = col[:-2]
                y_col = f"{base_col}_y"
                
                if y_col in final_data.columns:
                    final_data[base_col] = final_data[col].combine_first(final_data[y_col])
                    final_data.drop([col, y_col], axis=1, inplace=True)
                    logger.info(f"중복 컬럼 처리 완료: {base_col}")
            
            return final_data
            
        except Exception as e:
            logger.error(f"데이터 병합 중 오류 발생: {str(e)}")
            return None
    
    def save_integrated_data(self, final_data: pd.DataFrame) -> bool:
        """
        통합된 데이터를 파일로 저장합니다.
        
        Parameters:
        -----------
        final_data : pd.DataFrame
            저장할 통합 데이터프레임
            
        Returns:
        --------
        bool
            저장 성공 여부
        """
        try:
            final_data.to_csv(self.output_file, index=False, encoding='utf-8-sig')
            logger.info(f"통합 데이터 저장 완료: {self.output_file}")
            logger.info(f"데이터 크기: {len(final_data)} 행, {len(final_data.columns)} 열")
            return True
        except Exception as e:
            logger.error(f"데이터 저장 중 오류 발생: {str(e)}")
            return False
    
    def integrate(self) -> Optional[pd.DataFrame]:
        """
        전체 데이터 통합 프로세스를 실행합니다.
        
        Returns:
        --------
        pd.DataFrame or None
            통합된 데이터프레임 또는 오류 발생 시 None
        """
        if not self.load_datasets():
            return None
            
        try:
            self.preprocess_data()
            final_data = self.merge_datasets()
            
            if final_data is not None and self.save_integrated_data(final_data):
                return final_data
            return None
            
        except Exception as e:
            logger.error(f"데이터 통합 중 오류 발생: {str(e)}")
            return None

def main():
    """메인 실행 함수"""
    input_files = {
        'api': '../data/education_data_20250331.csv',
        'kess': '../data/kess_stats_20250331.csv',
        'infra': '../data/school_digital_infra.csv'
    }
    output_file = '../data/integrated_education_data.csv'
    
    integrator = EducationDataIntegrator(input_files, output_file)
    integrated_data = integrator.integrate()
    
    if integrated_data is not None:
        logger.info("데이터 통합이 성공적으로 완료되었습니다.")
    else:
        logger.error("데이터 통합 중 오류가 발생했습니다.")

if __name__ == "__main__":
    main()
