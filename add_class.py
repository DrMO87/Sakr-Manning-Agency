import sys
content = '''

class SaveApplicantView(APIView):
    \"\"\"
    Accepts reviewed structured JSON from the frontend and saves it into the
    Applicant and Users tables.
    \"\"\"
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        try:
            structured_json = request.data.get('structured_data')
            if not structured_json:
                return Response({'error': 'No structured_data provided'}, status=status.HTTP_400_BAD_REQUEST)

            file_name = request.data.get('file_name', 'manual_upload.pdf')

            with transaction.atomic():
                _pd  = structured_json.get('1_personal_details', {})
                _edu = structured_json.get('2_education', {})
                _cd  = structured_json.get('3_contact_details', {})
                _td  = structured_json.get('4_travel_documents', [])
                _pq  = structured_json.get('5_professional_qualification_certificate_of_competency', [])
                _nok = structured_json.get('6_next_of_kin_emergency_contact', {})
                _hcv = structured_json.get('7_health_certificates_and_vaccinations', {})
                _mc  = structured_json.get('8_marine_courses', [])
                _ss  = structured_json.get('9_complete_sea_service_details', {})
                _ref = structured_json.get('10_references', [])
                _dec = structured_json.get('11_declaration', {})
                _ofc = structured_json.get('12_for_office_use_only', {})

                ms_raw = _pd.get('marital_status', {})
                if isinstance(ms_raw, dict):
                    if ms_raw.get('married'):
                        marital_str = 'Married'
                    elif ms_raw.get('single'):
                        marital_str = 'Single'
                    else:
                        marital_str = ''
                    _pd_for_model = {**_pd, 'marital_status': marital_str}
                else:
                    _pd_for_model = _pd

                _cd_normalised = {
                    'Email': _cd.get('e_mail', '') or _cd.get('Email', ''),
                    'Mobile_Tel': _cd.get('mobile_tel', '') or _cd.get('Mobile_Tel', ''),
                    'Home_Address_City': _cd.get('home_address_city', '') or _cd.get('Home_Address_City', ''),
                }

                _td_normalised = []
                for doc in (_td if isinstance(_td, list) else []):
                    _td_normalised.append({
                        'Type': doc.get('type', doc.get('Type', '')),
                        'Document_No': doc.get('document_no', doc.get('Document_No', '')),
                        'ISS_Date': doc.get('iss_date', doc.get('ISS_Date', '')),
                        'Exp_Date': doc.get('exp_date', doc.get('Exp_Date', '')),
                        'ISS_By_Authority': doc.get('iss_by_authority', doc.get('ISS_By_Authority', '')),
                        'Place_of_Issue': doc.get('place_of_issue', doc.get('Place_of_Issue', '')),
                    })

                applicant = Applicant.objects.create(
                    personal_details=_pd_for_model,
                    education=_edu,
                    contact_details=_cd_normalised,
                    travel_documents=_td_normalised,
                    professional_qualifications=_pq,
                    next_of_kin_emergency_contact=_nok,
                    health_certificates_vaccinations=_hcv,
                    covid_19_vaccination=_hcv.get('covid_19', {}),
                    marine_courses=_mc,
                    sea_service_details=_ss.get('service_records', []),
                    specialised_experience=[],
                    references=_ref,
                    declaration=_dec,
                    office_use_only=_ofc,
                    physical_measurements={},
                    language_skills={},
                    medical_history={},
                    assessments={},
                    competency_tests={},
                    applied_position_info={},
                )

                logger.info(f'Successfully created applicant with ID: {applicant.id}')

                applicant_serializer = ApplicantToUsersSerializer(applicant)

                user = None
                user_error = None
                try:
                    logger.info('Converting applicant to Users model')
                    from api.models import Users
                    from django.db import models
                    from datetime import datetime
                    
                    serializer_data = applicant_serializer.data

                    email = serializer_data.get('email')
                    if not email:
                        raise ValueError(['Email is required'])
                    
                    def convert_date(date_str):
                        if not date_str or not str(date_str).strip():
                            return None
                        
                        date_str = str(date_str).strip()
                        formats = ['%d/%m/%Y', '%d-%m-%Y', '%Y-%m-%d', '%d/%m/%y', '%d-%m-%y', '%Y/%m/%d']
                        for fmt in formats:
                            try:
                                dt = datetime.strptime(date_str, fmt)
                                return dt.strftime('%Y-%m-%d')
                            except ValueError:
                                continue
                        return None
                    
                    user_model_fields = {f.name: f for f in Users._meta.get_fields()}
                    defaults = {}
                    for field_name, value in serializer_data.items():
                        if field_name in ['id', 'email', 'created_at', 'updated_at', 'ranks', 'certificates', 'references', 'sea_services']:
                            continue
                        if field_name not in user_model_fields:
                            continue
                        
                        field = user_model_fields[field_name]
                        if isinstance(field, (models.DateField, models.DateTimeField)):
                            defaults[field_name] = convert_date(value)
                        elif isinstance(field, (models.IntegerField, models.BigIntegerField, models.SmallIntegerField)):
                            try:
                                defaults[field_name] = int(value) if value and str(value).strip() else None
                            except (ValueError, TypeError):
                                defaults[field_name] = None
                        elif isinstance(field, (models.FloatField, models.DecimalField)):
                            try:
                                defaults[field_name] = float(value) if value and str(value).strip() else None
                            except (ValueError, TypeError):
                                defaults[field_name] = None
                        elif isinstance(field, models.BooleanField):
                            defaults[field_name] = bool(value) if value else False
                        elif isinstance(field, models.JSONField):
                            defaults[field_name] = value if value else {}
                        else:
                            defaults[field_name] = value if value else ''
                    
                    user, created = Users.objects.update_or_create(
                        email=email,
                        defaults=defaults
                    )
                    
                except Exception as ue:
                    user_error = f'User creation error: {str(ue)}'
                    logger.error(f'Failed to create user: {ue}')

                response_status = status.HTTP_201_CREATED
                message = 'Data saved successfully to both databases'

                if 'error' in structured_json:
                    response_status = status.HTTP_206_PARTIAL_CONTENT
                    message = 'Data saved with parsing issues'

                if not user:
                    response_status = status.HTTP_206_PARTIAL_CONTENT
                    message = 'Data saved to Applicant database, but failed to save to Users database'

                from datetime import datetime
                return Response({
                    'id': applicant.id,
                    'user': user.id if user else None,
                    'user_name': _pd_for_model.get('full_name', '') if isinstance(_pd_for_model, dict) else '',
                    'user_email_display': user.email if user else None,
                    'status': 'Pending',
                    'submitted_date': datetime.now().strftime('%Y-%m-%d'),
                    'notes': 'Saved from Review Data',
                    '_upload_meta': {
                        'success': True,
                        'message': message,
                        'user_creation_status': 'success' if user else 'failed',
                        'user_error': user_error,
                    }
                }, status=response_status)

        except Exception as e:
            import traceback
            logger.error(traceback.format_exc())
            return Response({
                'success': False,
                'error': 'Failed to save applicant',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

'''
with open('ai_document/views.py', 'a', encoding='utf-8') as f:
    f.write(content)
print('Done!')
