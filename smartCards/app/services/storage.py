import io
import json
from typing import Optional

from minio import Minio
from minio.error import S3Error

from app.core.config import settings


class StorageService:
    def __init__(self):
        # клиент для внутренней работы (docker)
        self.client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE,
        )

        self.bucket = settings.MINIO_BUCKET
        self.public_endpoint = settings.MINIO_PUBLIC_ENDPOINT

    def ensure_bucket(self):
        try:
            if not self.client.bucket_exists(self.bucket):
                self.client.make_bucket(self.bucket)

            # Устанавливаем публичный доступ для чтения файлов
            self._set_public_policy()
        except S3Error:
            raise

    def _set_public_policy(self):
        """Устанавливает политику публичного доступа к бакету для чтения"""
        try:
            policy = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Principal": "*",
                        "Action": ["s3:GetObject"],
                        "Resource": f"arn:aws:s3:::{self.bucket}/*",
                    }
                ],
            }
            self.client.set_bucket_policy(self.bucket, json.dumps(policy))
            print(f"✅ Bucket {self.bucket} set to public read-only")
        except Exception as e:
            print(f"⚠️ Could not set bucket policy: {e}")

    def upload_bytes(
        self, data: bytes, object_name: str, content_type: Optional[str] = None
    ):
        f = io.BytesIO(data)
        f.seek(0)

        self.client.put_object(
            self.bucket,
            object_name,
            data=f,
            length=len(data),
            content_type=content_type or "application/octet-stream",
        )

    def get_presigned_url(self, object_name: str, expires: int = 3600):
        try:
            # Возвращаем просто URL без подписей
            # Бакет настроен на публичное чтение, поэтому подписи не нужны
            # URL: http://localhost/storage/smartcards-files/groups/...
            public_url = (
                self.public_endpoint.rstrip("/")
                + "/"
                + self.bucket
                + "/"
                + object_name
            )
            return public_url
        except Exception as e:
            print("❌ get_presigned_url error:", e)
            return None

    def delete_object(self, object_name: str):
        try:
            self.client.remove_object(self.bucket, object_name)
        except S3Error:
            raise


storage = StorageService()
