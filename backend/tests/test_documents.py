import pytest
import uuid
from app.models.document import Document
from app.services.document_service import DocumentService


@pytest.mark.asyncio
async def test_document_hash_verification_direct():
    """Verify SHA-256 cryptographic hash match on Document."""
    test_id = uuid.uuid4()
    dummy_doc = Document(
        id=test_id,
        entity_type="PROJECT",
        entity_id=uuid.uuid4(),
        document_type="SECTION_11_GAZETTE",
        file_name="Section_11_Gazette_Notice.pdf",
        file_path="/storage/documents/notice.pdf",
        file_size_bytes=102400,
        mime_type="application/pdf",
        sha256_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        uploaded_by_user_id=uuid.uuid4(),
        verification_status="VERIFIED",
        version=1,
    )

    class MockDB:
        async def execute(self, stmt):
            class MockResult:
                def scalar_one_or_none(self):
                    return dummy_doc
            return MockResult()

    res = await DocumentService.verify_document_hash(MockDB(), test_id)
    assert res.is_valid is True
    assert res.stored_sha256_hash == dummy_doc.sha256_hash
    assert res.computed_sha256_hash == dummy_doc.sha256_hash
    assert "cryptographic integrity verified" in res.status_message.lower()
